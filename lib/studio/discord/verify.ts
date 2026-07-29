/**
 * Discord interaction signature verification.
 *
 * Discord signs every request with Ed25519 and *requires* that unsigned or badly signed
 * requests get a 401 — it sends deliberately invalid signatures when you save the
 * endpoint URL and refuses the endpoint if any of them are accepted. So this is not
 * merely defensive: failing it correctly is part of the handshake.
 *
 * Implemented on node:crypto rather than a library. Discord hands out a raw 32-byte
 * public key, and Node only accepts SPKI DER, so the fixed 12-byte Ed25519 DER header is
 * prepended — that is the whole trick, and it saves a dependency.
 */
import { createPublicKey, verify } from 'node:crypto';

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

export function verifyDiscordSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKeyHex = process.env.DISCORD_PUBLIC_KEY
): boolean {
  if (!signature || !timestamp || !publicKeyHex) return false;

  try {
    const key = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyHex, 'hex')]),
      format: 'der',
      type: 'spki',
    });

    return verify(
      null,
      Buffer.from(timestamp + rawBody),
      key,
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Malformed hex in the header or the key — treat as a failed signature, never as an
    // error the caller might accidentally swallow into a 200.
    return false;
  }
}
