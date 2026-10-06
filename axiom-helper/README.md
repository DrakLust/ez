# AXIOM HELPER

Bot de Discord (discord.js v14). Por ahora: da el rol **Miembro** a quien entra al servidor.

## Configuración
1. https://discord.com/developers/applications > New Application > **Bot**.
2. En *Bot*, activa **Server Members Intent** y copia el token (Reset Token).
3. En *OAuth2 > URL Generator*: scopes `bot`; permiso **Manage Roles**. Invita el bot con esa URL.
4. En tu servidor, sube el rol del bot por encima del rol *Miembro* (Ajustes > Roles).
5. Local:
   ```
   cp .env.example .env     # pega el token
   npm install
   npm run setup-profile    # nombre + foto (una vez)
   npm start
   ```

## Reglas
Edita `src/rules.js` y reinicia el bot. En Discord usa `/reglas` (necesita permiso *Gestionar servidor*) para publicarlas; opcionalmente elige el canal.
