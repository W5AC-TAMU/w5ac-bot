const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /server
// Replies information about the server the command was in.
// If not in a guild, replies to user explaining they are not in a guild.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		try {
			if(interaction.guild != null) {
				await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
			} else {
				await interaction.reply('This is not a server.');
			}
		} catch(error) {
			signale.error(error);
		}
	},
};
