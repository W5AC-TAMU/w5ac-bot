const { SlashCommandBuilder, EmbedBuilder, parseResponse } = require('discord.js');
const { table } = require('table');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /allstar
// Replies with stats for allstar node or table of linkes used by the node

module.exports = {
	data: new SlashCommandBuilder()
		.setName('allstar')
		.setDescription('Fetches information for ASL node')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('What stats to fetch')
				.setRequired(true)
				.addChoices(
					{ name: 'Stats', value: 'stats' },
					{ name: 'Links', value: 'links' },
				))
		.addIntegerOption(option =>
					option.setName('node')
						.setDescription('Node number to fetch stats for')
						.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const node = interaction.options.getInteger('node')
		switch(interaction.options.getString('category') ?? 'unknown') {
			case 'stats':
				try {
					var stats = await fetch(`http://stats.allstarlink.org/api/stats/${node}`).then((res) => res.json());
					var statsEmbed = new EmbedBuilder()
						.setColor(0x79A737)
						.setTitle(`Node ${stats.stats.node}`)
						.setURL(`https://stats.allstarlink.org/stats/${stats.stats.node}`)
						.setDescription(`${stats.node.callsign} ${stats.node.server.Location}`)
						.setImage(`https://stats.allstarlink.org/stats/${stats.stats.node}/networkMap`)
						.setTimestamp()
					await interaction.followUp({embeds: [statsEmbed]});
				} catch(error) {
					signale.error(error);
				}
				break;
			case 'links':
				try {
					var stats = await fetch(`http://stats.allstarlink.org/api/stats/${node}`).then((res) => res.json());
					var statsEmbed = new EmbedBuilder()
						.setColor(0x79A737)
						.setTitle(`Node ${stats.stats.node}`)
						.setURL(`https://stats.allstarlink.org/stats/${stats.stats.node}`)
						.setDescription(`${stats.node.callsign} ${stats.node.server.Location}`)
						.setTimestamp()
					await interaction.followUp({embeds: [statsEmbed]});
					var linkNodes = [['Node', 'Callsign', 'Location']]
					for(var i = 0; i < stats.stats.data.linkedNodes.length; i++) {
						var linkedNode = stats.stats.data.linkedNodes[i]?.name ?? stats.stats.data.linkedNodes[i]?.Node_ID ?? 'Unknown';
						var linkedCallsign = stats.stats.data.linkedNodes[i]?.User_ID ?? '';
						var linkedLocation = stats.stats.data.linkedNodes[i]?.server?.Location ?? '';
						linkNodes.push([linkedNode, linkedCallsign, linkedLocation])
					}
					await interaction.followUp('\`\`\`' + table(linkNodes).toString() + '\`\`\`');
				} catch(error) {
					signale.error(error);
				}
				break;
			default:
				await interaction.followUp('Unable to parse request. Please fix command.');
		}
	},
};
