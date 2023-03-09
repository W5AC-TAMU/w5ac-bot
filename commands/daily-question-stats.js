const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /daily-question-stats
// Replies with license exam stats for the member mentioned or the user who ran the command

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily-question-stats')
		.setDescription('Gets player statistics for daily license question')
		.addUserOption(option =>
			option.setName('user')
			.setDescription('The user to find stats for')),
	async execute(interaction) {
		// Load answers file and find index of current user
		var answers;
		var playerIndex;
		try {
			await interaction.deferReply();
			answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));
			var userId = interaction.options?.getUser('user')?.id ?? interaction.user.id;

			playerIndex = -1;
			for(var i = 0; i < answers.length; i++) {
				if(answers[i].id === String(userId)) {
					playerIndex = i;
					break;
				}
			}
		} catch(error) {
			signale.error(error);
		}
		
		// If player is not found, print a message and gracefully return
		if(playerIndex === -1) {
			try {
				await interaction.followUp('User not found in answers.');
				signale.debug('Couldn\'t find user');
				return;
			} catch(error) {
				signale.error(error);
			}
		} else {
			try {
				// Update nickname to be guild nickname instead of global nickname
				// Current migration away from old standard
				if(answers[i].nickname != interaction.guild.members.cache.find(member => member.id === interaction.user.id).displayName) {
					answers[i].nickname = interaction.guild.members.cache.find(member => member.id === interaction.user.id).displayName;
				}
				
				var playerAnswers = answers[playerIndex].answers;
				var answeredTech = 0;
				var answeredGeneral = 0;
				var answeredExtra = 0;
				var correctTech = 0;
				var correctGeneral = 0;
				var correctExtra = 0;
				// For every answered question, check which pool it came from and update the totals if it is correct or not
				for(var i = 0; i < playerAnswers.length; i++) {
					switch(playerAnswers[i].pool) {
						case 'tech':
							if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
								correctTech++;
							}
							answeredTech++;
							break;
						case 'general':
							if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
								correctGeneral++;
							}
							answeredGeneral++;
							break;
						case 'extra':
							if(playerAnswers[i].answer === playerAnswers[i].answerCorrect) {
								correctExtra++;
							}
							answeredExtra++;
							break;
						default:
							break;
					}
				}

				// Build stats embed with nickname, total stats, and stats for each exam pool
				const embed = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle(`Statistics for ${interaction.guild.members.cache.find(member => member.id === userId).displayName}`)
					.setDescription(`Total: ${correctTech + correctGeneral + correctExtra}/${answeredTech + answeredGeneral + answeredExtra}\t${Math.round(((correctTech + correctGeneral + correctExtra)/(answeredTech + answeredGeneral + answeredExtra))*10000)/100}%`)
					.addFields(
						{ name: 'Technician: ', value: `${correctTech}/${answeredTech}\t${Math.round((correctTech/answeredTech)*10000)/100}%` },
						{ name: 'General: ', value: `${correctGeneral}/${answeredGeneral}\t${Math.round((correctGeneral/answeredGeneral)*10000)/100}%` },
						{ name: 'Extra: ', value: `${correctExtra}/${answeredExtra}\t${Math.round((correctExtra/answeredExtra)*10000)/100}%` },
					)
					.setTimestamp()
				await interaction.followUp({ embeds: [embed] });
			} catch(error) {
				signale.error(error);
			}
		}
	},
};
