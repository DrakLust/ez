require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const rulesConfig = require('./rules');

const { DISCORD_TOKEN, MEMBER_ROLE_NAME = 'Member', MEMBER_ROLE_ID } = process.env;
if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in the .env file');
  process.exit(1);
}

// GuildMembers is a privileged intent: enable it in Developer Portal > Bot.
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
  return guild.roles.create({ name: MEMBER_ROLE_NAME, reason: 'AXIOM HELPER member role' });
}

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Post the server rules in a channel')
    .addChannelOption((o) =>
      o.setName('channel').setDescription('Channel to post in (defaults to this one)').addChannelTypes(ChannelType.GuildText),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
].map((c) => c.toJSON());

client.once('clientReady', async (c) => {
  console.log(`${c.user.tag} connected in ${c.guilds.cache.size} server(s).`);
  // Per-guild registration: commands show up instantly.
  for (const guild of c.guilds.cache.values()) {
    await guild.commands.set(commands).catch((e) => console.error(`Could not register commands in ${guild.name}:`, e.message));
  }
});

client.on('guildCreate', (guild) => guild.commands.set(commands).catch(console.error));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'rules') return;
  try {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const embed = new EmbedBuilder()
      .setTitle(rulesConfig.title)
      .setColor(rulesConfig.color)
      .setDescription(rulesConfig.rules.map((r, i) => `**${i + 1}.** ${r}`).join('\n\n'))
      .setFooter({ text: rulesConfig.footer });
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `Rules posted in ${channel}.`, flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('Error in /rules:', err);
    const msg = "I couldn't post the rules. Check that the bot can write in that channel.";
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral });
    else await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
  }
});

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  try {
    const me = member.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      console.warn(`[${member.guild.name}] I'm missing the "Manage Roles" permission.`);
      return;
    }
    const role = await getMemberRole(member.guild);
    if (role.position >= me.roles.highest.position) {
      console.warn(`[${member.guild.name}] The role "${role.name}" is above mine. Move the bot's role higher in Server Settings > Roles.`);
      return;
    }
    await member.roles.add(role, 'Automatic role on join');
    console.log(`[${member.guild.name}] ${member.user.tag} -> ${role.name}`);
  } catch (err) {
    console.error(`Error giving role to ${member.user?.tag}:`, err);
  }
});

process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));
client.login(DISCORD_TOKEN);
