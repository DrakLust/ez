// Sets the bot's name and avatar. Run once: npm run setup-profile
require('dotenv').config();
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async (c) => {
  try {
    if (c.user.username !== 'AXIOM HELPER') await c.user.setUsername('AXIOM HELPER');
    await c.user.setAvatar(path.join(__dirname, '..', 'assets', 'avatar.png'));
    console.log('Profile updated: AXIOM HELPER + avatar.');
  } catch (err) {
    console.error('Could not update the profile (Discord rate-limits these changes):', err.message);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
