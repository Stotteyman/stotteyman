import 'server-only';

import crypto from 'node:crypto';

import WebSocket from 'ws';

/**
 * Microsoft Edge neural text-to-speech, spoken from the server.
 *
 * Free, keyless, and the same engine clip-studio already uses for voiceovers, so
 * stream TTS and video voiceovers sound like the same channel.
 *
 * Why this is server-side rather than `speechSynthesis` in the overlay page:
 * OBS's embedded CEF ships without a speech backend, so `getVoices()` returns an
 * empty list and a browser-side implementation silently produces nothing at all.
 * The same lesson the live-captions work learned about speech *recognition*
 * applies to synthesis. Rendering to MP3 here and playing an <audio> element in
 * the overlay works in CEF, in Moblin's web view, and in a normal browser.
 */

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

/**
 * MUST track a currently-shipping Edge build. Microsoft rejects the WebSocket
 * handshake with a bare `403` when this version is stale — there is no error body
 * and nothing that points at the version, so it reads as "TTS is broken".
 * If synthesis starts 403ing, bump this first: it is the single most likely cause.
 * Cross-check against the `edge-tts` Python package's constants.py.
 */
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR = CHROMIUM_FULL_VERSION.split('.')[0];

const WIN_EPOCH = 11644473600n;

/** Windows-file-time epoch for 1601-01-01, in seconds. */
function secMsGec(): string {
  // Ticks are ~1.3e17 — past Number.MAX_SAFE_INTEGER — so this is BigInt, not
  // Number. A float here produces a plausible-looking wrong hash and a 403.
  let seconds = BigInt(Math.floor(Date.now() / 1000)) + WIN_EPOCH;
  seconds -= seconds % 300n; // round down to a 5-minute boundary
  const ticks = seconds * 10_000_000n; // 100-nanosecond intervals
  return crypto
    .createHash('sha256')
    .update(`${ticks}${TRUSTED_CLIENT_TOKEN}`, 'ascii')
    .digest('hex')
    .toUpperCase();
}

/** XML-escape. Unescaped `&` or `<` in a viewer's message breaks the SSML document. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** edge-tts wants signed relative strings: 1.0 -> "+0%", 1.15 -> "+15%". */
function relativePercent(value: number): string {
  return `${Math.round((value - 1) * 100) >= 0 ? '+' : ''}${Math.round((value - 1) * 100)}%`;
}

export type SynthOptions = {
  voice?: string;
  /** 1.0 = normal. Clamped to the range Microsoft accepts. */
  rate?: number;
  volume?: number;
};

export const DEFAULT_VOICE = 'en-US-AndrewMultilingualNeural';

/**
 * Synthesise `text` to MP3 (24 kHz, 48 kbps mono).
 *
 * Rejects rather than returning a partial buffer: half a sentence on stream is
 * worse than silence, and the caller falls back to the browser voice on failure.
 */
export function synthesise(text: string, opts: SynthOptions = {}): Promise<Buffer> {
  const voice = opts.voice || DEFAULT_VOICE;
  const rate = Math.min(2, Math.max(0.5, opts.rate ?? 1));
  const volume = Math.min(1, Math.max(0, opts.volume ?? 1));

  return new Promise<Buffer>((resolve, reject) => {
    const url =
      `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
      `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
      `&Sec-MS-GEC=${secMsGec()}` +
      `&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`;

    const ws = new WebSocket(url, {
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent':
          `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ` +
          `Chrome/${CHROMIUM_MAJOR}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR}.0.0.0`,
        Cookie: `muid=${crypto.randomBytes(16).toString('hex').toUpperCase()};`,
      },
    });

    const chunks: Buffer[] = [];
    let settled = false;

    const finish = (err: Error | null, buf?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* already closing */
      }
      if (err) reject(err);
      else resolve(buf!);
    };

    // A hung socket must not hold a serverless invocation open to its own timeout.
    const timer = setTimeout(() => finish(new Error('edge-tts timed out')), 12_000);

    ws.on('open', () => {
      const ts = new Date().toISOString();
      ws.send(
        `X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: 'false',
                    wordBoundaryEnabled: 'false',
                  },
                  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                },
              },
            },
          })
      );

      const requestId = crypto.randomUUID().replace(/-/g, '');
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
        `<voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='${relativePercent(rate)}' volume='${relativePercent(volume)}'>` +
        `${escapeXml(text)}` +
        `</prosody></voice></speak>`;

      ws.send(
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n${ssml}`
      );
    });

    ws.on('message', (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        // Binary frame: 2-byte big-endian header length, headers, then audio bytes.
        const buf = Buffer.from(data);
        if (buf.length < 2) return;
        const headerLength = buf.readUInt16BE(0);
        const header = buf.subarray(2, 2 + headerLength).toString('utf8');
        if (header.includes('Path:audio')) chunks.push(buf.subarray(2 + headerLength));
        return;
      }
      if (data.toString().includes('Path:turn.end')) {
        const audio = Buffer.concat(chunks);
        if (!audio.length) finish(new Error('edge-tts returned no audio'));
        else finish(null, audio);
      }
    });

    ws.on('error', (err: Error) => finish(err));
    ws.on('unexpected-response', (_req, res) => {
      finish(
        new Error(
          `edge-tts handshake ${res.statusCode}` +
            (res.statusCode === 403
              ? ' — Sec-MS-GEC-Version is probably stale, bump CHROMIUM_FULL_VERSION'
              : '')
        )
      );
    });
    ws.on('close', () => finish(new Error('edge-tts closed before turn.end')));
  });
}
