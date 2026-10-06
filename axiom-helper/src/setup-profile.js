require('dotenv').config();
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async () => {
  try {
    if (client.user.username !== 'AXIOM HELPER') {
      await client.user.setUsername('AXIOM HELPER');
    }
    await client.user.setAvatar(path.join(__dirname, '..', 'assets', 'avatar.png'));
    console.log('Profile updated.');
  } catch (err) {
    console.error('Could not update the profile:', err.message);
  }
  client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
