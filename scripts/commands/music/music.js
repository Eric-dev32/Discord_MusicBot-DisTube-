const { joinVoiceChannel, getVoiceConnections } = require("@discordjs/voice");
const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require("../../index.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Music System")
    .addSubcommand(subcommand => 
        subcommand.setName("play")
        .setDescription("Play a song")
        .addStringOption(option => 
            option
            .setName("query")
            .setDescription("Provide the name or url of the song")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName("volume")
        .setDescription("Set volume")
        .addIntegerOption(option => 
            option.setName("percent")
            .setDescription("10 = 10%") 
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand => 
        subcommand.setName("options")
        .setDescription("Select an option")
        .addStringOption(option => 
            option.setName("options")
            .setDescription("Select an options")
            .setRequired(true)
            .addChoices(
                {name: "queue", value: "queue"},
                {name: "skip", value: "skip"},
                {name: "pause", value: "pause"},
                {name: "resume", value: "resume"},
                {name: "stop", value: "stop"},
            )    
        )
    ),
    async execute(interaction) {
        const {options, member, guild, channel} = interaction;

        const subcommand = options.getSubcommand();
        const query = options.getString("query");
        const volume = options.getInteger("percent");
        const option = options.getString("options");
        const VoiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();

        if (!VoiceChannel) {
            embed.setColor("Red").setDescription("You must be in a voice channel to execute music commands.");
            return interaction.reply({ embeds: [embed], ephemeral: true});
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed.setColor("Red").setDescription(`The bot is already active in <#${guild.members.me.voice.channelID}>`);
            return interaction.reply({embeds: [embed], ephemeral: true})
        }

        try {
            switch (subcommand) {
                case "play":
                    //const voiceConnection = joinVoiceChannel({
                    //    channelId: '1085985502987026487',
                    //    guildId: interaction.guildId,
                    //    adapterCreator: interaction.guild.voiceAdapterCreator,
                    //})
                    //console.log(getVoiceConnections())
                    client.distube.play(VoiceChannel, query, { textChannel: channel, member: member});
                    return interaction.reply({content: "🎧 Request received"});
                case "volume":
                    client.distube.setVolume(VoiceChannel, volume);
                    return interaction.reply({content: `📻 Set volume to ${volume}%`})
                case "options":
                    const queue = await client.distube.getQueue(VoiceChannel);

                    if(!queue) {
                        embed.setColor("Red").setDescription("There is no active queue");
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }

                    switch(option) {
                        case "skip":
                            await queue.skip(VoiceChannel)
                            embed.setColor("Blue").setDescription("The song has been skipped");
                            return interaction.reply({embeds: [embed], ephemeral: true});
                        case "stop":
                            await queue.stop(VoiceChannel)
                            embed.setColor("Red").setDescription("The queue has been stopped");
                            return interaction.reply({embeds: [embed], ephemeral: true});
                        case "pause":
                            await queue.pause(VoiceChannel)
                            embed.setColor("Orange").setDescription("The song has been paused");
                            return interaction.reply({embeds: [embed], ephemeral: true});
                        case "resume":
                            await queue.resume(VoiceChannel)
                            embed.setColor("Green").setDescription("The song has been resumed");
                            return interaction.reply({embeds: [embed], ephemeral: true});
                        case "queue":
                            embed.setColor("Purple").setDescription(`${queue.songs.map(
                                (song, id) => `\n**${id + 1} ** ${song.name} -\`${song.formattedDuration}\``
                            )}`);
                            return interaction.reply({embeds: [embed], ephemeral: true});    
                    }
            }
        } catch(err) {
            console.log(err)

            embed.setColor("Red").setDescription("Something went wrong...")


            return interaction.reply({embeds: [embed], ephemeral: true});    

        }
    },
}