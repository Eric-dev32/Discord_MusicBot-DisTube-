///////////////////////////////////////// Dependencies /////////////////////////////////////////

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");

///////////////////////////////////////// Basic Config /////////////////////////////////////////

config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
});

client.commands = new Collection();

///////////////////////////////////////// Commands Loading /////////////////////////////////////////

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

function loadCommands() {
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(commandsPath, folder))
      .filter((file) => file.endsWith(".js"));
    //console.log(path.join(commandsPath, folder))
    //console.log(commandFiles)

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, folder, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        console.log(`loaded command /${command.data.name}`);
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}

///////////////////////////////////////// Event Handling /////////////////////////////////////////

function eventHandle() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    //console.log(event.name);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

///////////////////////////////////////// Music /////////////////////////////////////////

function musicTest() {
  const status = (queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${
      queue.filters.names.join(", ") || "Off"
    }\` | Loop: \`${
      queue.repeatMode
        ? queue.repeatMode === 2
          ? "All Queue"
          : "This Song"
        : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
  client.distube.on("playSong", (queue, song) =>
    queue.textChannel.send(
      `${client.emotes.play} | Playing \`${song.name}\` - \`${
        song.formattedDuration
      }\`\nRequested by: ${song.user}\n${status(queue)}`
    )
  );
}

///////////////////////////////////////// Bot Login /////////////////////////////////////////

if (require.main == module) {
  loadCommands();
  eventHandle();
  musicTest();
  client.login(TOKEN);
}

module.exports = client;