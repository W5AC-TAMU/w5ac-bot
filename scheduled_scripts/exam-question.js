const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;
const fs = require('node:fs');
const signale = require('signale');
const mongoose = require('mongoose');

signale.config({displayTimestamp: true, displayDate: true});

// License exam questions bot
// Posts daily license questions in channel configured by config file and updates answer file based on button reactions

const configSchema = new mongoose.Schema({
	'_id': String,
	'channels': {
		'logs': String,
		'role': String,
		'daily_question': String,
		'audio_stream': String
	},
	'audio_stream_url': String
})
const Config = mongoose.model('Guild-Config', configSchema);

const examSchema = new mongoose.Schema({
	'_id': String,
	'question_id': String,
	'id_tech': String,
	'id_general': String,
	'id_extra': String,
	'exam_records': [
		{
			'_id': String,
			'record_old': Map,
			'answers': [
				{
					'_id': String,
					'answer': Number,
					'correct': Boolean
				}
			]
		}
	]
})
const Exam = mongoose.model('Exam-Daily-Question', examSchema);

const questionSchema = new mongoose.Schema({
	'_id': String,
	'correct': Number,
	'question': String,
	'answers': {
		0: String,
		1: String,
		2: String,
		3: String
	}
})
const Question = mongoose.model('FCC-Question', questionSchema);


module.exports = {
	client: null,
	db: null,
	init: function(client) {
		this.client = client;
		this.db = mongoose.connect('mongodb://127.0.0.1:27017/w5ac-bot');
		this.questions();
	},
	// Post questions
	questions: async function() {
		const schedule = new CronJob('0 * * * * *', async function() {
			try {
				// Execute the daily questions for every guild
				module.exports.client.guilds.cache.forEach(async guild => {
					// Get guild config
					Config.findById(guild.id).then(async (config) => {
						// Don't do exams if exam channel is not defined
						if(config.channels.daily_question != null) {
							let channel = module.exports.client.channels.cache.get(config.channels.daily_question);
							// Find exam record for guild
							Exam.findById(guild.id).then(async (exam) => {
								// Handle previous exam for guild
								if(exam != null) {
									// If there is a previous question, close it and return the correct answers
									try {
										signale.debug(`Handling previous daily questions for guild ${guild.name} <${guild.id}>`);
										// Find message id of the last exam questions
										let channel = module.exports.client.channels.cache.get(config.channels.daily_question);
										let messageT = await channel.messages.fetch(exam.id_tech);
										let messageG = await channel.messages.fetch(exam.id_general);
										let messageE = await channel.messages.fetch(exam.id_extra);

										// Get question id from embed
										var idT = '';
										for(var i = 0; i < messageT.embeds[0].fields.length; i++) {
											if(messageT.embeds[0].fields[i].name == 'Question') {
												idT = messageT.embeds[0].fields[i].value.split(']')[0].split('[')[1];
												break;
											}
										}
										var idG = '';
										for(var i = 0; i < messageG.embeds[0].fields.length; i++) {
											if(messageG.embeds[0].fields[i].name == 'Question') {
												idG = messageG.embeds[0].fields[i].value.split(']')[0].split('[')[1];
												break;
											}
										}
										var idE = '';
										for(var i = 0; i < messageE.embeds[0].fields.length; i++) {
											if(messageE.embeds[0].fields[i].name == 'Question') {
												idE = messageE.embeds[0].fields[i].value.split(']')[0].split('[')[1];
												break;
											}
										}

										// Get FCC question from database and correct letter
										Question.findById(idT).then((question) => {
											// Define updated row
											var rowTU = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId('daily-exam-tech-a')
													.setLabel('A')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-tech-b')
													.setLabel('B')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-tech-c')
													.setLabel('C')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-tech-d')
													.setLabel('D')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true)
											);
											rowTU.components[question.correct].setStyle(ButtonStyle.Success);
											messageT.edit({ components: [rowTU] });
										}).catch((error) => {
											signale.error(error);
										});

										Question.findById(idG).then((question) => {
											// Define updated row
											var rowGU = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId('daily-exam-general-a')
													.setLabel('A')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-general-b')
													.setLabel('B')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-general-c')
													.setLabel('C')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-general-d')
													.setLabel('D')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true)
											);
											rowGU.components[question.correct].setStyle(ButtonStyle.Success);
											messageG.edit({ components: [rowGU] });
										}).catch((error) => {
											signale.error(error);
										});

										Question.findById(idE).then((question) => {
											// Define updated row
											var rowEU = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId('daily-exam-extra-a')
													.setLabel('A')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-extra-b')
													.setLabel('B')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-extra-c')
													.setLabel('C')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true),
												new ButtonBuilder()
													.setCustomId('daily-exam-extra-d')
													.setLabel('D')
													.setStyle(ButtonStyle.Danger)
													.setDisabled(true)
											);
											rowEU.components[question.correct].setStyle(ButtonStyle.Success);
											messageE.edit({ components: [rowEU] });
										}).catch((error) => {
											signale.error(error);
										});
									} catch(error) {
										signale.error(error);
									}
								} else {
									// Create exam if it doesn't exist
									exam = new Exam({'_id': guild.id, 'question_id': null, 'id_tech': null, 'id_general': null, 'id_extra': null, 'exam_records': []});
									exam.save();
									signale.debug(`No previous question for guild ${guild.name} <${guild.id}>`);
								}

								// Send new questions
								signale.debug(`Sending new daily questions for guild ${guild.name} <${guild.id}>`);
								let sentD = await channel.send({content: `Questions for ${new Date().toLocaleDateString()}`});
								exam.question_id = sentD.id;

								try {
									const techPoolQ = Question.find({'_id': {$regex: '^T[0-9][A-F][0-9][0-9]$'}});
									const poolT = await techPoolQ.exec();
									var randT = Math.floor(Math.random() * poolT.length)
									var questionT = poolT.at(randT);
									
									var embedT = new EmbedBuilder()
										.setColor(0x500000)
										.setTitle('Technician question')
										.addFields(
											{ name: 'Question', value: `[${questionT.id}] ${questionT.question}` },
											{ name: 'Answers', value: `A. ${questionT.answers[0]}\nB. ${questionT.answers[1]}\nC. ${questionT.answers[2]}\nD. ${questionT.answers[3]}`}
										);
									const rowT = new ActionRowBuilder()
										.addComponents(
											new ButtonBuilder()
												.setCustomId('daily-exam-tech-a')
												.setLabel('A')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-tech-b')
												.setLabel('B')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-tech-c')
												.setLabel('C')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-tech-d')
												.setLabel('D')
												.setStyle(ButtonStyle.Primary),
										);
										
									var filesT = []
									if(questionT.question.toUpperCase().includes('FIGURE T-1')) {
										filesT.push(new AttachmentBuilder('./resources/exams/T-1.png'));
										embedT.setImage('attachment://T-1.png');
									} else if(questionT.question.toUpperCase().includes('FIGURE T-2')) {
										filesT.push(new AttachmentBuilder('./resources/exams/T-2.png'));
										embedT.setImage('attachment://T-2.png');
									} else if(questionT.question.toUpperCase().includes('FIGURE T-3')) {
										filesT.push(new AttachmentBuilder('./resources/exams/T-3.png'));
										embedT.setImage('attachment://T-3.png');
									}
			
									let sentT = await channel.send({embeds: [embedT], files: filesT, components: [rowT]});
									exam.id_tech = sentT.id;
								} catch(error) {
									signale.error(error);
								}
			
								try {
									const generalPoolQ = Question.find({'_id': {$regex: '^G[0-9][A-F][0-9][0-9]$'}});
									const poolG = await generalPoolQ.exec();
									var randG = Math.floor(Math.random() * poolG.length)
									var questionG = poolG.at(randG);
									
									var embedG = new EmbedBuilder()
										.setColor(0x500000)
										.setTitle('General question')
										.addFields(
											{ name: 'Question', value: `[${questionG.id}] ${questionG.question}` },
											{ name: 'Answers', value: `A. ${questionG.answers[0]}\nB. ${questionG.answers[1]}\nC. ${questionG.answers[2]}\nD. ${questionG.answers[3]}`}
										);
									const rowG = new ActionRowBuilder()
										.addComponents(
											new ButtonBuilder()
												.setCustomId('daily-exam-general-a')
												.setLabel('A')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-general-b')
												.setLabel('B')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-general-c')
												.setLabel('C')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-general-d')
												.setLabel('D')
												.setStyle(ButtonStyle.Primary),
										);
									
									var filesG = []
									if(questionG.question.toUpperCase().includes('FIGURE G7-1')) {
										filesG.push(new AttachmentBuilder('./resources/exams/G7-1.png'));
										embedG.setImage('attachment://G7-1.png');
									}
			
									let sentG = await channel.send({embeds: [embedG], files: filesG, components: [rowG]});
									exam.id_general = sentG.id;
								} catch(error) {
									signale.error(error);
								}

								try {
									const ExtraPoolQ = Question.find({'_id': {$regex: '^E[0-9][A-F][0-9][0-9]$'}});
									const poolE = await ExtraPoolQ.exec();
									var randE = Math.floor(Math.random() * poolE.length)
									var questionE = poolE.at(randE);
									
									var embedE = new EmbedBuilder()
										.setColor(0x500000)
										.setTitle('Extra question')
										.addFields(
											{ name: 'Question', value: `[${questionE.id}] ${questionE.question}` },
											{ name: 'Answers', value: `A. ${questionE.answers[0]}\nB. ${questionE.answers[1]}\nC. ${questionE.answers[2]}\nD. ${questionE.answers[3]}`}
										);
									const rowE = new ActionRowBuilder()
										.addComponents(
											new ButtonBuilder()
												.setCustomId('daily-exam-extra-a')
												.setLabel('A')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-extra-b')
												.setLabel('B')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-extra-c')
												.setLabel('C')
												.setStyle(ButtonStyle.Primary),
											new ButtonBuilder()
												.setCustomId('daily-exam-extra-d')
												.setLabel('D')
												.setStyle(ButtonStyle.Primary),
										);
									
									var filesE = []
									if(questionE.question.toUpperCase().includes('FIGURE E5-1')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E5-1.png'));
										embedE.setImage('attachment://E5-1.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E6-1')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E6-1.png'));
										embedE.setImage('attachment://E6-1.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E6-2')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E6-2.png'));
										embedE.setImage('attachment://E6-2.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E6-3')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E6-3.png'));
										embedE.setImage('attachment://E6-3.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E7-1')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E7-1.png'));
										embedE.setImage('attachment://E7-1.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E7-2')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E7-2.png'));
										embedE.setImage('attachment://E7-2.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E7-3')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E7-3.png'));
										embedE.setImage('attachment://E7-3.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E9-1')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E9-1.png'));
										embedE.setImage('attachment://E9-1.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E9-2')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E9-2.png'));
										embedE.setImage('attachment://E9-2.png');
									} else if(questionE.question.toUpperCase().includes('FIGURE E9-3')) {
										filesE.push(new AttachmentBuilder('./resources/exams/E9-3.png'));
										embedE.setImage('attachment://E9-3.png');
									}
			
									let sentE = await channel.send({embeds: [embedE], files: filesE, components: [rowE]});
									exam.id_extra = sentE.id;
								} catch(error) {
									signale.error(error);
								}

								// Save changes to previous question
								exam.save();
							}).catch((error) => {
								signale.error(error);
							});
						}
					}).catch((error) => {
						try {
							var newGuild = new Config({'_id': guild.id, 'channels': {'logs': null, 'role': null, 'daily_question': null, 'audio_stream': null}, 'audio_stream_url': null});
							newGuild.save();
						} catch(error) {
							signale.error(error);
						}
						signale.error(error);
					});
				});
			} catch(error) {
				signale.error(error);
			}
		});

		// Start scheduled script
		schedule.start();
	},

	// Handle button press answers
	answers: async function(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });
			const player = await Exam.find({'_id': interaction.guild.id, 'exam_records._id': interaction.user.id}).exec();
			if(player.length != 0) {
				// Handle player with previous answers
				const answerIndex = ['a', 'b', 'c', 'd'].indexOf(interaction.customId.split('-')[3]);

				// Get question id from embed
				let questionID = '';
				for(var i = 0; i < interaction.message.embeds[0].fields.length; i++) {
					if(interaction.message.embeds[0].fields[i].name == 'Question') {
						questionID = interaction.message.embeds[0].fields[i].value.split(']')[0].split('[')[1];
						break;
					}
				}
				const question = await Question.findById(questionID).exec();
				console.dir(interaction.user.id);

				var playerRecord = player[0].exam_records.filter(player => player._id === interaction.user.id);
				console.log("This is what I am looking at");
				console.dir(playerRecord[0].exam_records);
			} else {
				// New player
				const answerIndex = ['a', 'b', 'c', 'd'].indexOf(interaction.customId.split('-')[3]);

				// Get question id from embed
				let questionID = '';
				for(var i = 0; i < interaction.message.embeds[0].fields.length; i++) {
					if(interaction.message.embeds[0].fields[i].name == 'Question') {
						questionID = interaction.message.embeds[0].fields[i].value.split(']')[0].split('[')[1];
						break;
					}
				}
				const question = await Question.findById(questionID).exec();

				const guild = await Exam.findById(interaction.guild.id).exec();
				guild.exam_records.push({'_id': interaction.user.id, 'answers': [{'_id': interaction.message.id, 'answer': answerIndex, 'correct': answerIndex == question.correct}]})
				guild.save();
				await interaction.followUp({ content: `Answer ${['A', 'B', 'C', 'D'].at(answerIndex)} recorded for question ${questionID}`, ephemeral: true });
			}
		} catch(error) {
			signale.error(error);
			await interaction.followUp({ content: 'There was an error recording your answer. Please try again later.', ephemeral: true });
		}
	}
};
