const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /user
// Replies information about the user who ran the command.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		try {
			await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
		} catch(error) {
			signale.error(error);
		}
	},
	async execute(interaction) {
		try {
			if(interaction.guild != null) {
				await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
			} else {
				await interaction.reply(`This command was run by ${interaction.user.username}.`);
			}
		} catch(error) {
			signale.error(error);
		}
	},
};
