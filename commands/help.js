const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /help
// Prints help message detailing all commands.
// TODO: Add help for individual commands

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
							'value': 'User (default is person who ran command)',
							'required': false
						}
					]
				},
				{
					'command': 'help',
					'description': 'Displays this help mesasge',
					'options': []
				},
				{
					'comamnd': 'lookup',
					'description': 'Lookup callsign using HamDB',
					'options': [
						{
							'name': 'call',
							'value': 'callsgin',
							'required': true
						},
						{
							'name': 'verbose',
							'value': 'boolean (default is false)',
							'required': false
						}
					]
				},
				{
					'command': 'ping',
					'description': 'Provides discord ping information to the user',
					'options': []
				},
				{
					'command': 'server',
					'description': 'Provides information about the server if run in a server',
					'options': []
				},
				{
					'command': 'user',
					'description': 'Provides information about the user who ran the command',
					'options': []
				}
			]
		} catch(error) {
			signale.error(error);
		}
	},
};
