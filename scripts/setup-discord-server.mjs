#!/usr/bin/env node
/**
 * Provisions the public Stotteyman Discord server.
 *
 * Idempotent and matched by name: run it as many times as you like. Existing roles and
 * channels are reused and their permissions corrected, never duplicated. Nothing is
 * deleted — removing a channel stays a deliberate human act.
 *
 *   node scripts/setup-discord-server.mjs              # dry run, prints the plan
 *   node scripts/setup-discord-server.mjs --apply      # actually creates things
 *   node scripts/setup-discord-server.mjs --inspect    # dump the current server
 *
 * Needs DISCORD_BOT_TOKEN and DISCORD_GUILD_ID, and the bot needs Manage Roles and
 * Manage Channels. Role creation is capped by the bot's own highest role, so invite it
 * with a role positioned above anything it must manage.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* rely on the real environment */
  }
}
loadEnvLocal();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD = process.env.DISCORD_GUILD_ID;
const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');

if (!TOKEN || !GUILD) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_GUILD_ID must be set.');
  process.exit(1);
}

const API = 'https://discord.com/api/v10';
const headers = { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' };

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 429) {
    const retry = Number((await res.json()).retry_after ?? 1);
    console.log(`   rate limited, waiting ${retry}s`);
    await new Promise((r) => setTimeout(r, retry * 1000 + 250));
    return api(method, path, body);
  }

  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

// Permission bits used below.
const P = {
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  MANAGE_MESSAGES: 1n << 13n,
  ATTACH_FILES: 1n << 15n,
  ADD_REACTIONS: 1n << 6n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
};

/**
 * Roles, lowest privilege first. `hoist` shows the role as its own sidebar group.
 *
 * "WAGE Society Member" is deliberately absent: the W.A.G.E. bot creates and owns that
 * role on guildCreate, and creating it here first would leave two roles with one name.
 */
const ROLES = [
  { name: 'Verified', color: 0x2ecc71, hoist: false, mentionable: false },
  { name: 'Supporter', color: 0xf1c40f, hoist: true, mentionable: false },
  { name: 'Notify: Streams', color: 0x9b59b6, hoist: false, mentionable: true },
  { name: 'Notify: Releases', color: 0x3498db, hoist: false, mentionable: true },
  { name: 'Moderator', color: 0xe67e22, hoist: true, mentionable: false },
  { name: 'Team', color: 0xe8291a, hoist: true, mentionable: false },
];

const TEXT = 0;
const VOICE = 2;
const CATEGORY = 4;
const ANNOUNCEMENT = 5;

/**
 * `readOnly` removes SEND_MESSAGES from @everyone but leaves reactions and threads on.
 * `private` hides the channel from @everyone entirely and grants it back to `allow`.
 */
const STRUCTURE = [
  {
    category: '📌 START HERE',
    channels: [
      { name: 'welcome', type: TEXT, readOnly: true, topic: 'Rules and what this place is.' },
      {
        name: 'announcements',
        type: ANNOUNCEMENT,
        readOnly: true,
        topic: 'Posts published from Studio land here.',
      },
      { name: 'roles', type: TEXT, readOnly: true, topic: 'Pick your notification roles.' },
    ],
  },
  {
    category: '🗣️ COMMUNITY',
    channels: [
      { name: 'general', type: TEXT, topic: 'Main chat.' },
      { name: 'introductions', type: TEXT, topic: 'Say hello.' },
      { name: 'clips-and-screenshots', type: TEXT, topic: 'Show your best moments.' },
      { name: 'off-topic', type: TEXT, topic: 'Everything else.' },
    ],
  },
  {
    category: '🎮 PROJECTS',
    channels: [
      { name: 'furiouspvp', type: TEXT, topic: 'Arma Reforger — FuriousPvP.' },
      { name: 'og-interactive', type: TEXT, topic: 'OG Interactive studio work.' },
      { name: 'wage-society', type: TEXT, topic: 'W.A.G.E. Society.' },
      { name: 'support', type: TEXT, topic: 'Need help? Ask here.' },
    ],
  },
  {
    category: '🔴 LIVE',
    channels: [
      { name: 'go-live', type: TEXT, readOnly: true, topic: 'Stream notifications.' },
      { name: 'stream-chat', type: TEXT, topic: 'Chat while the stream runs.' },
      { name: 'Stream VC', type: VOICE },
      { name: 'General VC', type: VOICE },
    ],
  },
  {
    category: '🔒 STUDIO',
    private: true,
    allow: ['Team'],
    channels: [
      {
        name: 'studio',
        type: TEXT,
        topic: 'Drop content here, then long-press → Apps → Distribute.',
      },
      { name: 'studio-log', type: TEXT, topic: 'Publish results and failures.' },
    ],
  },
  {
    category: '🛡️ STAFF',
    private: true,
    allow: ['Team', 'Moderator'],
    channels: [
      { name: 'staff-chat', type: TEXT },
      { name: 'mod-log', type: TEXT },
    ],
  },
];

const plan = [];
const note = (action, what) => {
  plan.push(`${action === 'create' ? '+' : action === 'update' ? '~' : '='} ${what}`);
  console.log(`${action === 'create' ? '  +' : action === 'update' ? '  ~' : '  ='} ${what}`);
};

const guild = await api('GET', `/guilds/${GUILD}`);
const existingRoles = await api('GET', `/guilds/${GUILD}/roles`);
const existingChannels = await api('GET', `/guilds/${GUILD}/channels`);

console.log(`\nServer: ${guild.name}  (${existingChannels.length} channels, ${existingRoles.length} roles)\n`);

if (args.has('--inspect')) {
  const byId = new Map(existingChannels.map((c) => [c.id, c]));
  console.log('Roles:');
  for (const role of existingRoles.sort((a, b) => b.position - a.position)) {
    console.log(`  ${role.name}${role.managed ? '  (bot-managed)' : ''}`);
  }
  console.log('\nChannels:');
  for (const c of existingChannels.filter((c) => c.type === CATEGORY).sort((a, b) => a.position - b.position)) {
    console.log(`  ${c.name}`);
    for (const child of existingChannels.filter((x) => x.parent_id === c.id).sort((a, b) => a.position - b.position)) {
      console.log(`    #${child.name}  (type ${child.type})`);
    }
  }
  const orphans = existingChannels.filter((c) => c.type !== CATEGORY && !byId.has(c.parent_id));
  if (orphans.length) {
    console.log('\n  Uncategorised:');
    orphans.forEach((c) => console.log(`    #${c.name}`));
  }
  process.exit(0);
}

// ── Roles ────────────────────────────────────────────────────────────────────
const roleId = new Map(existingRoles.map((r) => [r.name, r.id]));

console.log('Roles');
for (const role of ROLES) {
  if (roleId.has(role.name)) {
    note('skip', `role "${role.name}" exists`);
    continue;
  }
  if (!APPLY) {
    note('create', `role "${role.name}"`);
    continue;
  }
  const created = await api('POST', `/guilds/${GUILD}/roles`, {
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    mentionable: role.mentionable,
  });
  roleId.set(role.name, created.id);
  note('create', `role "${role.name}"`);
}

// ── Channels ─────────────────────────────────────────────────────────────────
function overwrites(spec) {
  const everyone = GUILD; // @everyone's role id equals the guild id.
  const out = [];

  if (spec.private) {
    out.push({ id: everyone, type: 0, deny: String(P.VIEW_CHANNEL) });
    for (const name of spec.allow ?? []) {
      const id = roleId.get(name);
      if (id) out.push({ id, type: 0, allow: String(P.VIEW_CHANNEL | P.SEND_MESSAGES | P.ATTACH_FILES) });
    }
  } else if (spec.readOnly) {
    out.push({
      id: everyone,
      type: 0,
      deny: String(P.SEND_MESSAGES),
      allow: String(P.VIEW_CHANNEL | P.ADD_REACTIONS | P.CREATE_PUBLIC_THREADS),
    });
    const team = roleId.get('Team');
    if (team) out.push({ id: team, type: 0, allow: String(P.SEND_MESSAGES | P.MANAGE_MESSAGES) });
  }

  return out;
}

console.log('\nChannels');
for (const group of STRUCTURE) {
  let parent = existingChannels.find((c) => c.type === CATEGORY && c.name === group.category);

  if (!parent) {
    if (!APPLY) {
      note('create', `category "${group.category}"`);
    } else {
      parent = await api('POST', `/guilds/${GUILD}/channels`, {
        name: group.category,
        type: CATEGORY,
        permission_overwrites: overwrites(group),
      });
      existingChannels.push(parent);
      note('create', `category "${group.category}"`);
    }
  } else {
    note('skip', `category "${group.category}" exists`);
  }

  for (const channel of group.channels) {
    const slug = channel.type === VOICE ? channel.name : channel.name.toLowerCase();
    const found = existingChannels.find(
      (c) => c.name === slug && c.type === channel.type && (!parent || c.parent_id === parent.id)
    );

    if (found) {
      note('skip', `  #${slug} exists`);
      continue;
    }
    if (!APPLY) {
      note('create', `  #${slug}`);
      continue;
    }

    const created = await api('POST', `/guilds/${GUILD}/channels`, {
      name: slug,
      type: channel.type,
      topic: channel.topic,
      parent_id: parent?.id,
      permission_overwrites: overwrites({ ...group, readOnly: channel.readOnly }),
    });
    existingChannels.push(created);
    note('create', `  #${slug}`);

    if (slug === 'studio') {
      console.log(`\n     → set DISCORD_STUDIO_CHANNEL_ID=${created.id}`);
    }
    if (slug === 'announcements') {
      console.log(`     → set DISCORD_ANNOUNCE_CHANNEL_ID=${created.id}`);
    }
  }
}

console.log(
  APPLY
    ? `\nDone. ${plan.filter((p) => p.startsWith('+')).length} things created.`
    : `\nDry run — nothing changed. ${plan.filter((p) => p.startsWith('+')).length} things would be created. Re-run with --apply.`
);
