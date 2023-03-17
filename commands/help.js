const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /server
// Replies information about the server the command was in.
// If not in a guild, replies to user explaining they are not in a guild.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Provides help information about bot.'),
	async execute(interaction) {
		try {
			commands = [
				{
					'command': 'allstar',
					'description': 'Provides stats or links of specified allstar node',
					'options': [
						{
							'name': 'category',
							'value': ['stats', 'links'],
							'required': true
						},
						{
							'name': 'node',
							'value': 'node #',
							'required': true
						}
					]
				},
				{
					'command': 'daily-question-stats',
					'description': 'Provides statistics for daily question responses for user',
					'options': [
						{
							'name': 'user',
							'value': 'User',
							'required': false
						}
					]

				}
			]
		} catch(error) {
			signale.error(error);
		}
	},
};
