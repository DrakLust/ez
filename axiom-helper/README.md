# AXIOM HELPER

Discord bot (discord.js v14). Gives the **Member** role to everyone who joins and posts the server rules with `/rules`.

## Setup
1. https://discord.com/developers/applications > New Application > **Bot**.
2. In *Bot*, enable **Server Members Intent** and copy the token (Reset Token).
3. In *OAuth2 > URL Generator*: scope `bot`; permission **Manage Roles** (and Send Messages / Embed Links for `/rules`). Invite the bot with that URL.
4. In your server, move the bot's role above the *Member* role (Server Settings > Roles).
5. Locally:
   ```
   cp .env.example .env     # paste the token
   npm install
   npm run setup-profile    # name + avatar (once)
   npm start
   ```

## Rules
Edit `src/rules.js` and restart the bot. In Discord use `/rules` (requires *Manage Server*) to post the banner and the rules in one card; optionally pick the channel.
