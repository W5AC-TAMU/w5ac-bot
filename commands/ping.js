const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /ping
// Replies with ping information then updates with roundtrip time.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		try {
			const sent = await interaction.reply({content: 'Pinging...', fetchReply: true });
			interaction.editReply(`Websocket heartbeat: ${interaction.client.ws.ping}ms. Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
		} catch(error) {
			signale.error(error);
		}
	},
};
