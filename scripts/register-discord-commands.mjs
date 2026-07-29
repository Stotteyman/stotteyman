#!/usr/bin/env node
/**
 * Registers the Studio commands with Discord.
 *
 * Guild-scoped by default: guild commands appear instantly, while global ones can take
 * up to an hour to propagate. Since these are private publishing tools for one server,
 * guild scope is also the correct permanent home — pass --global only if that changes.
 *
 *   node scripts/register-discord-commands.mjs [--global] [--list] [--clear]
 *
 * Reads DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID and DISCORD_GUILD_ID from the
 * environment or from .env.local.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  } catch {
    // No .env.local — rely on the real environment.
  }
}

loadEnvLocal();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const args = new Set(process.argv.slice(2));
const global = args.has('--global');

if (!TOKEN || !APP_ID) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID must be set.');
  process.exit(1);
}
if (!global && !GUILD_ID) {
  console.error('DISCORD_GUILD_ID must be set (or pass --global).');
  process.exit(1);
}

const base = `https://discord.com/api/v10/applications/${APP_ID}`;
const url = global ? `${base}/commands` : `${base}/guilds/${GUILD_ID}/commands`;

/** Attachment options are how a slash command accepts files. One option per file. */
const mediaOptions = [1, 2, 3, 4].map((n) => ({
  name: `media${n}`,
  description: `Photo or video ${n}`,
  type: 11, // ATTACHMENT
  required: false,
}));

const COMMANDS = [
  {
    // type 3 = MESSAGE. Appears under Apps when you long-press / right-click a message.
    name: 'Distribute',
    type: 3,
  },
  {
    name: 'post',
    type: 1, // CHAT_INPUT
    description: 'Compose a post and distribute it to your channels',
    options: [
      { name: 'text', description: 'The caption or body', type: 3, required: false },
      ...mediaOptions,
    ],
  },
];

async function call(method, path = '', body) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`${method} ${url}${path} → ${res.status}`);
    console.error(text);
    process.exit(1);
  }
  return text ? JSON.parse(text) : null;
}

if (args.has('--list')) {
  const existing = await call('GET');
  console.log(`${existing.length} command(s) registered ${global ? 'globally' : 'in guild'}:`);
  for (const command of existing) {
    console.log(`  ${command.type === 3 ? '[message]' : '[slash]  '} ${command.name}`);
  }
  process.exit(0);
}

if (args.has('--clear')) {
  await call('PUT', '', []);
  console.log('Cleared all commands.');
  process.exit(0);
}

// PUT replaces the whole set, so a removed command actually disappears rather than
// lingering from a previous run.
const result = await call('PUT', '', COMMANDS);
console.log(`Registered ${result.length} command(s) ${global ? 'globally' : `in guild ${GUILD_ID}`}:`);
for (const command of result) {
  console.log(`  ${command.type === 3 ? '[message]' : '[slash]  '} ${command.name}`);
}
console.log('\nNext: set the Interactions Endpoint URL in the Developer Portal to');
console.log(`  ${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stotteyman.com'}/api/discord/interactions`);
