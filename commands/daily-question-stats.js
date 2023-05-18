const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const signale = require('signale');
const mongoose = require('mongoose');
const { Config, Exam, Question} = require('../schema')

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
		try {
			await interaction.deferReply();
			mongoose.connect('mongodb://127.0.0.1:27017/w5ac-bot');
			var userId = interaction.options?.getUser('user')?.id ?? interaction.user.id;
			if(interaction.guild != null) {
				var guildRecord = await Exam.findById(interaction.guild.id).exec();
				if(guildRecord.exam_records.id(userId) == null) {
					interaction.followUp(`<@${userId}> has not answered any questions.`);
					return;
				}
				var guildPlayerRecord = guildRecord.exam_records.id(userId).answers;
				var guildPlayerRecordOld = guildRecord.exam_records.id(userId).record_old;

				let guildTechCorrect = 0;
				let guildTechAnswered = 0;
				let guildGeneralCorrect = 0;
				let guildGeneralAnswered = 0;
				let guildExtraCorrect = 0;
				let guildExtraAnswered = 0;

				if(guildPlayerRecord.length == 0) {
					interaction.followUp(`<@${userId}> has not answered any questions.`);
					return;
				}

				for(var i = 0; i < guildPlayerRecord.length; i++) {
					switch(guildPlayerRecord[i].question[0]) {
						case 'T':
							if(guildPlayerRecord[i].correct) {
								guildTechCorrect++;
							}
							guildTechAnswered++;
							break;
						case 'G':
							if(guildPlayerRecord[i].correct) {
								guildGeneralCorrect++;
							}
							guildGeneralAnswered++;
							break;
						case 'E':
							if(guildPlayerRecord[i].correct) {
								guildExtraCorrect++;
							}
							guildExtraAnswered++;
							break;
						default:
							signale.error(`Unknown question ${guildPlayerRecord[i].question}`);
							break;
					}
				}

				try {
					guildTechCorrect += guildPlayerRecordOld.get('techCorrect');
					guildTechAnswered += guildPlayerRecordOld.get('techAnswered');
					guildGeneralCorrect += guildPlayerRecordOld.get('generalCorrect');
					guildGeneralAnswered += guildPlayerRecordOld.get('generalAnswered');
					guildExtraCorrect += guildPlayerRecordOld.get('extraCorrect');
					guildExtraAnswered += guildPlayerRecordOld.get('extraAnswered');
				} catch(error) {
					signale.debug("Guild doesn't have old records");
				}

				let totalCorrect = guildTechCorrect + guildGeneralCorrect + guildExtraCorrect;
				let totalAnswered = guildTechAnswered + guildGeneralAnswered + guildExtraAnswered;

				const embed = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle(`Statistics for ${interaction.guild.members.cache.find(member => member.id === userId).displayName}`)
					.setDescription(`Total: ${totalCorrect}/${totalAnswered}\t${Math.round((totalCorrect/totalAnswered)*10000)/100}%`)
					.addFields(
						{ name: 'Technician: ', value: `${guildTechCorrect}/${guildTechAnswered}\t${Math.round((guildTechCorrect/guildTechAnswered)*10000)/100}%` },
						{ name: 'General: ', value: `${guildGeneralCorrect}/${guildGeneralAnswered}\t${Math.round((guildGeneralCorrect/guildGeneralAnswered)*10000)/100}%` },
						{ name: 'Extra: ', value: `${guildExtraCorrect}/${guildExtraAnswered}\t${Math.round((guildExtraCorrect/guildExtraAnswered)*10000)/100}%` },
					)
					.setTimestamp()
				await interaction.followUp({ embeds: [embed] });
			} else {
				signale.debug("Command for stats run in DM");
				interaction.followUp("Stats command must be run in a server.");
			}
			// await interaction.followUp({ embeds: [embed] });
		} catch(error) {
			signale.error(error);
		}
	},
};
