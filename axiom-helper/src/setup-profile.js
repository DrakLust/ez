// Pone el nombre y la foto del bot. Ejecutar una vez: npm run setup-profile
require('dotenv').config();
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async (c) => {
  try {
    if (c.user.username !== 'AXIOM HELPER') await c.user.setUsername('AXIOM HELPER');
    await c.user.setAvatar(path.join(__dirname, '..', 'assets', 'avatar.png'));
    console.log('Perfil actualizado: AXIOM HELPER + avatar.');
  } catch (err) {
    console.error('No se pudo actualizar el perfil (Discord limita estos cambios por hora):', err.message);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
