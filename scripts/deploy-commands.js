const { config } = require('dotenv');
const { REST, Routes } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

config();

const TOKEN=process.env.BOT_TOKEN
const CLIENT_ID=process.env.CLIENT_ID

/////////////////////////////////////////////////////////////////////////////

const commands = []

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith(".js"))
    //console.log(path.join(commandsPath, folder))
    //console.log(commandFiles)
	
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, folder, file);
	    const command = require(filePath);
		console.log('data' in command && 'execute' in command)
	    // Set a new item in the Collection with the key as the command name and the value as the exported module
	    if ('data' in command && 'execute' in command) {
			console.log('command set')
	    	commands.push(command.data.toJSON());
	    } else {
	    	console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	    }
    }
}

/////////////////////////////////////////////////////////////////////////////

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();