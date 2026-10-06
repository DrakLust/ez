require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const { DISCORD_TOKEN, MEMBER_ROLE_NAME = 'Miembro', MEMBER_ROLE_ID } = process.env;
if (!DISCORD_TOKEN) {
  console.error('Falta DISCORD_TOKEN en el archivo .env');
  process.exit(1);
}

// GuildMembers es un intent privilegiado: actívalo en Developer Portal > Bot.
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

async function getMemberRole(guild) {
  if (MEMBER_ROLE_ID) {
    const byId = guild.roles.cache.get(MEMBER_ROLE_ID) ?? (await guild.roles.fetch(MEMBER_ROLE_ID).catch(() => null));
    if (byId) return byId;
  }
  await guild.roles.fetch();
  const byName = guild.roles.cache.find((r) => r.name.toLowerCase() === MEMBER_ROLE_NAME.toLowerCase());
  if (byName) return byName;
  return guild.roles.create({ name: MEMBER_ROLE_NAME, reason: 'Rol de miembro de AXIOM HELPER' });
}

client.once('clientReady', (c) => {
  console.log(`${c.user.tag} conectado en ${c.guilds.cache.size} servidor(es).`);
});

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  try {
    const me = member.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      console.warn(`[${member.guild.name}] Me falta el permiso "Gestionar roles".`);
      return;
    }
    const role = await getMemberRole(member.guild);
    if (role.position >= me.roles.highest.position) {
      console.warn(`[${member.guild.name}] El rol "${role.name}" está por encima del mío. Súbeme el rol del bot en Ajustes > Roles.`);
      return;
    }
    await member.roles.add(role, 'Rol automático al entrar');
    console.log(`[${member.guild.name}] ${member.user.tag} -> ${role.name}`);
  } catch (err) {
    console.error(`Error dando rol a ${member.user?.tag}:`, err);
  }
});

process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
client.login(DISCORD_TOKEN);
