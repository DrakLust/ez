require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  AttachmentBuilder,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const path = require('path');
const rulesData = require('./rules');

const bannerPath = path.join(__dirname, '..', 'assets', 'rules-banner.png');

const token = process.env.DISCORD_TOKEN;
const roleName = process.env.MEMBER_ROLE_NAME || 'Member';
const roleId = process.env.MEMBER_ROLE_ID;

if (!token) {
  console.error('Missing DISCORD_TOKEN in the .env file');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Post the server rules in a channel')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to post in (defaults to this one)')
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .toJSON(),
];

async function findMemberRole(guild) {
  if (roleId) {
    const role = await guild.roles.fetch(roleId).catch(() => null);
    if (role) return role;
  }

  const roles = await guild.roles.fetch();
  const existing = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  if (existing) return existing;

  return guild.roles.create({ name: roleName });
}

async function registerCommands(guild) {
  try {
    await guild.commands.set(commands);
  } catch (err) {
    console.error(`Could not register commands in ${guild.name}:`, err.message);
  }
}

client.once('clientReady', async () => {
  console.log(`${client.user.tag} connected in ${client.guilds.cache.size} server(s).`);
  for (const guild of client.guilds.cache.values()) {
    await registerCommands(guild);
  }
});

client.on('guildCreate', registerCommands);

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;

  const guild = member.guild;
  const me = guild.members.me;

  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    console.warn(`[${guild.name}] I'm missing the "Manage Roles" permission.`);
    return;
  }

  try {
    const role = await findMemberRole(guild);

    if (role.position >= me.roles.highest.position) {
      console.warn(`[${guild.name}] The role "${role.name}" is above mine. Move the bot's role higher in Server Settings > Roles.`);
      return;
    }

    await member.roles.add(role);
    console.log(`[${guild.name}] ${member.user.tag} got the ${role.name} role`);
  } catch (err) {
    console.error(`Could not give the role to ${member.user.tag}:`, err);
  }
});

async function postRules(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  const card = new ContainerBuilder()
    .setAccentColor(rulesData.color)
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL('attachment://rules-banner.png'))
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(rulesData.text));

  try {
    await channel.send({
      components: [card],
      files: [new AttachmentBuilder(bannerPath, { name: 'rules-banner.png' })],
      flags: MessageFlags.IsComponentsV2,
    });
    await interaction.reply({ content: `Rules posted in ${channel}.`, flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error('Error in /rules:', err);
    await interaction.reply({
      content: "I couldn't post the rules. Check that the bot can write and attach files in that channel.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'rules') {
    return postRules(interaction);
  }
});

process.on('unhandledRejection', (err) => console.error(err));

client.login(token);
