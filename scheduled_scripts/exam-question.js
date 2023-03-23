const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;
const fs = require('node:fs');
const signale = require('signale');
const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

signale.config({displayTimestamp: true, displayDate: true});

// License exam questions bot
// Posts daily license questions in channel configured by config file and updates answer file based on button reactions

module.exports = {
	configFile: null,
	client: null,
	db: null,
	init: function(client, config) {
		this.client = client;
		this.configFile = config;
		this.db = mongoose.connect('mongodb://127.0.0.1:27017/w5ac-bot');

		this.questions();
		this.updateCorrect();
	},
	// Post questions
	questions: async function() {
		// New database work
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

		// Load exam pool files
		const poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
		const poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
		const poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));

		const schedule = new CronJob('0 * * * * *', async function() {
			try {
				// Execute the daily questions for every guild
				module.exports.client.guilds.cache.forEach(async guild => {
					// Deal with old questions
					Exam.findById(guild.id).then((result) => {
						if(result != null) {
							// If there is a previous question, close it and return the correct answers
							signale.debug(`Handling previous question for guild ${guild.name} <${guild.id}>`);

							// TODO: Handle previous questions
						} else {
							// If no previous question exists, print message.
							signale.debug(`No previous question for guild ${guild.name} <${guild.id}>`);
						}
						
						// Save changes to previous question
						result.save();
					}).catch((error) => {
						// null can be result from new servers that have no previous question
						signale.error(error);
					});

					// Send new questions
					var randT = Math.floor(Math.random() * poolT.length);
					var randG = Math.floor(Math.random() * poolG.length);
					var randE = Math.floor(Math.random() * poolE.length);

					// Embeds for each question
					var embedT = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('Technician question')
					.addFields(
						{ name: 'Question', value: `[${poolT[randT].id}] ${poolT[randT].question}` },
						{ name: 'Answers', value: `A. ${poolT[randT].answers[0]}\nB. ${poolT[randT].answers[1]}\nC. ${poolT[randT].answers[2]}\nD. ${poolT[randT].answers[3]}\n`}
					)

					var embedG = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('General question')
					.addFields(
						{ name: 'Question', value: `[${poolG[randG].id}] ${poolG[randG].question}` },
						{ name: 'Answers', value: `A. ${poolG[randG].answers[0]}\nB. ${poolG[randG].answers[1]}\nC. ${poolG[randG].answers[2]}\nD. ${poolG[randG].answers[3]}\n`}
					)

					var embedE = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('Extra question')
					.addFields(
						{ name: 'Question', value: `[${poolE[randE].id}] ${poolE[randE].question}` },
						{ name: 'Answers', value: `A. ${poolE[randE].answers[0]}\nB. ${poolE[randE].answers[1]}\nC. ${poolE[randE].answers[2]}\nD. ${poolE[randE].answers[3]}\n`}
					)

					// Button row for answer choices
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

					// Add figure to message if question mentions figure
					var filesT = []
					var filesG = []
					var filesE = []

					if(poolT[randT].question.toUpperCase().includes('FIGURE T-1')) {
						filesT.push(new AttachmentBuilder('./resources/exams/T-1.png'));
						embedT.setImage('attachment://T-1.png');
					} else if(poolT[randT].question.toUpperCase().includes('FIGURE T-2')) {
						filesT.push(new AttachmentBuilder('./resources/exams/T-2.png'));
						embedT.setImage('attachment://T-2.png');
					} else if(poolT[randT].question.toUpperCase().includes('FIGURE T-3')) {
						filesT.push(new AttachmentBuilder('./resources/exams/T-3.png'));
						embedT.setImage('attachment://T-3.png');
					}

					if(poolG[randG].question.toUpperCase().includes('FIGURE G7-1')) {
						filesG.push(new AttachmentBuilder('./resources/exams/G7-1.png'));
						embedG.setImage('attachment://G7-1.png');
					}

					if(poolE[randE].question.toUpperCase().includes('FIGURE E5-1')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E5-1.png'));
						embedE.setImage('attachment://E5-1.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-1')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E6-1.png'));
						embedE.setImage('attachment://E6-1.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-2')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E6-2.png'));
						embedE.setImage('attachment://E6-2.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-3')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E6-3.png'));
						embedE.setImage('attachment://E6-3.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-1')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E7-1.png'));
						embedE.setImage('attachment://E7-1.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-2')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E7-2.png'));
						embedE.setImage('attachment://E7-2.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-3')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E7-3.png'));
						embedE.setImage('attachment://E7-3.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-1')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E9-1.png'));
						embedE.setImage('attachment://E9-1.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-2')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E9-2.png'));
						embedE.setImage('attachment://E9-2.png');
					} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-3')) {
						filesE.push(new AttachmentBuilder('./resources/exams/E9-3.png'));
						embedE.setImage('attachment://E9-3.png');
					}

					// Send question message
					var channel;
					Config.findById(guild.id).then(async (result) => {
						console.log("Found config result");
						console.dir(result.channels.daily_question, {depth: null});
						let channel = module.exports.client.channels.cache.get(result.channels.daily_question);
						console.dir(channel, {depth: null});
						let sentD = await channel.send({content: `Questions for ${new Date().toLocaleDateString()}`});
						let sentT = await channel.send({embeds: [embedT], files: filesT, components: [rowT]});
						let sentG = await channel.send({embeds: [embedG], files: filesG, components: [rowG]});
						let sentE = await channel.send({embeds: [embedE], files: filesE, components: [rowE]});
						Exam.findById(guild.id).then((result) => {
							result.question_id = sentD.id;
							result.id_tech = sentT.id;
							result.id_general = sentG.id;
							result.id_extra = sentE.id;
							result.save();
						}).catch((error) => {
							var newGuild = new Exam({'_id': guild.id, 'question_id': sentD.id, 'id_tech': sentT.id, 'id_general': sentG.id, 'id_extra': sentE.id, 'exam_records': []});
							newGuild.save();
							signale.error(error);
						});
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


		// Load exam channel and exam pools from file
		let channel = this.client.channels.cache.find(ch => ch.name === this.configFile.exam_chan);
		// var poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
		// var poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
		// var poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));
		
		// Every day at 6 and 18 hours, run the function
		const job = new CronJob('0 0 0 * * *', async function() {
			// Close old questions and post answers. If no previous questions exist, fail gracefully
			try {
				// Find old messages from data storage file
				var questions = JSON.parse(fs.readFileSync('./resources/exams/questions.json', 'utf8'));
				let oldT = await channel.messages.fetch(questions[questions.length - 1].idTech);
				let oldG = await channel.messages.fetch(questions[questions.length - 1].idGeneral);
				let oldE = await channel.messages.fetch(questions[questions.length - 1].idExtra);

				// For each pool, find the question identifier
				var questionT = '';
				for(var i = 0; i < oldT.embeds[0].fields.length; i++) {
					if(oldT.embeds[0].fields[i].name == 'Question') {
						questionT = oldT.embeds[0].fields[i].value.split(']')[0].split('[')[1];
					}
				}
				var questionG = '';
				for(var i = 0; i < oldG.embeds[0].fields.length; i++) {
					if(oldG.embeds[0].fields[i].name == 'Question') {
						questionG = oldG.embeds[0].fields[i].value.split(']')[0].split('[')[1];
					}
				}
				var questionE = '';
				for(var i = 0; i < oldE.embeds[0].fields.length; i++) {
					if(oldE.embeds[0].fields[i].name == 'Question') {
						questionE = oldE.embeds[0].fields[i].value.split(']')[0].split('[')[1];
					}
				}

				// For each pool, find the correct answer choice
				var answerChoices = ['a', 'b', 'c', 'd']
				var answerCorrectT = '';
				var answerCorrectG = '';
				var answerCorrectE = '';
				for(var i = 0; i < poolT.length; i++) {
					if(poolT[i].id == questionT) {
						answerCorrectT = answerChoices[poolT[i].correct];
					}
				}
				for(var i = 0; i < poolG.length; i++) {
					if(poolG[i].id == questionG) {
						answerCorrectG = answerChoices[poolG[i].correct];
					}
				}
				for(var i = 0; i < poolE.length; i++) {
					if(poolE[i].id == questionE) {
						answerCorrectE = answerChoices[poolE[i].correct];
					}
				}

				// Build new button row with 4 disabled buttons that default to red for incorrect
				var rowTU = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('exam-tech-a')
						.setLabel('A')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-tech-b')
						.setLabel('B')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-tech-c')
						.setLabel('C')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-tech-d')
						.setLabel('D')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true)
				);
				var rowGU = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('exam-general-a')
						.setLabel('A')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-general-b')
						.setLabel('B')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-general-c')
						.setLabel('C')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-general-d')
						.setLabel('D')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true)
				);
				var rowEU = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('exam-extra-a')
						.setLabel('A')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-extra-b')
						.setLabel('B')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-extra-c')
						.setLabel('C')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('exam-extra-d')
						.setLabel('D')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(true)
				);

				// For each pool, set the correct answer to success for green color
				for(var i = 0; i < rowTU.components.length; i++) {
					if(rowTU.components[i].data.label.includes(answerCorrectT.toUpperCase())) {
						rowTU.components[i].setStyle(ButtonStyle.Success);
					}
				}
				for(var i = 0; i < rowGU.components.length; i++) {
					if(rowGU.components[i].data.label.includes(answerCorrectG.toUpperCase())) {
						rowGU.components[i].setStyle(ButtonStyle.Success);
					}
				}
				for(var i = 0; i < rowEU.components.length; i++) {
					if(rowEU.components[i].data.label.includes(answerCorrectE.toUpperCase())) {
						rowEU.components[i].setStyle(ButtonStyle.Success);
					}
				}

				// Post new button rows
				oldT.edit({ components: [rowTU] });
				oldG.edit({ components: [rowGU] });
				oldE.edit({ components: [rowEU] });

				//TODO: Add message congratulating those who were correct
				
				// Update player count of correct answers
				module.exports.updateCorrect();
			} catch(error) {
				signale.error(error);
			}

			// Send out questions for next round
			try {
				channel.send(`Questions for ${new Date().toLocaleDateString()}`);
				var idTech = '';
				var idGeneral = '';
				var idExtra = '';
				
				// Pick random questions from pool
				var randT = Math.floor(Math.random() * poolT.length);
				var randG = Math.floor(Math.random() * poolG.length);
				var randE = Math.floor(Math.random() * poolE.length);
			
				// Technician Pool
				// Build embed with question and answer choices
				var embedT = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('Technician question')
					.addFields(
						{ name: 'Question', value: `[${poolT[randT].id}] ${poolT[randT].question}` },
						{ name: 'Answers', value: `A. ${poolT[randT].answers[0]}\nB. ${poolT[randT].answers[1]}\nC. ${poolT[randT].answers[2]}\nD. ${poolT[randT].answers[3]}\n`}
					)

				// Button row for answer choices
				const rowT = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('exam-tech-a')
							.setLabel('A')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-tech-b')
							.setLabel('B')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-tech-c')
							.setLabel('C')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-tech-d')
							.setLabel('D')
							.setStyle(ButtonStyle.Primary),
					);

				// If question has figure attached, add to embed and send. If no figure, send out message
				if(poolT[randT].question.toUpperCase().includes('FIGURE T-1')) {
					const file = new AttachmentBuilder('./resources/exams/T-1.png');
					embedT.setImage('attachment://T-1.png');
					let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
					idTech = sent.id;
				} else if(poolT[randT].question.toUpperCase().includes('FIGURE T-2')) {
					const file = new AttachmentBuilder('./resources/exams/T-2.png');
					embedT.setImage('attachment://T-2.png');
					let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
					idTech = sent.id;
				} else if(poolT[randT].question.toUpperCase().includes('FIGURE T-3')) {
					const file = new AttachmentBuilder('./resources/exams/T-3.png');
					embedT.setImage('attachment://T-3.png');
					let sent = await channel.send({ embeds: [embedT], files: [file], components: [rowT] });
					idTech = sent.id;
				} else {
					let sent = await channel.send({ embeds: [embedT], components: [rowT] });
					idTech = sent.id;
				}

				// General Pool
				// Build embed with question and answer choices
				var embedG = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('General question')
					.addFields(
						{ name: 'Question', value: `[${poolG[randG].id}] ${poolG[randG].question}` },
						{ name: 'Answers', value: `A. ${poolG[randG].answers[0]}\nB. ${poolG[randG].answers[1]}\nC. ${poolG[randG].answers[2]}\nD. ${poolG[randG].answers[3]}\n`}
					)

				// Button row for answer choices
				const rowG = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('exam-general-a')
							.setLabel('A')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-general-b')
							.setLabel('B')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-general-c')
							.setLabel('C')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-general-d')
							.setLabel('D')
							.setStyle(ButtonStyle.Primary),
					);
				
				// If question has figure attached, add to embed and send. If no figure, send out message
				if(poolG[randG].question.toUpperCase().includes('FIGURE G7-1')) {
					const file = new AttachmentBuilder('./resources/exams/G7-1.png');
					embedG.setImage('attachment://G7-1.png');
					let sent = await channel.send({ embeds: [embedG], files: [file], components: [rowG] });
					idGeneral = sent.id;
				} else {
					let sent = await channel.send({ embeds: [embedG], components: [rowG] });
					idGeneral = sent.id;
				}

				// Extra Pool
				// Build embed with question and answer choices
				var embedE = new EmbedBuilder()
					.setColor(0x500000)
					.setTitle('Extra question')
					.addFields(
						{ name: 'Question', value: `[${poolE[randE].id}] ${poolE[randE].question}` },
						{ name: 'Answers', value: `A. ${poolE[randE].answers[0]}\nB. ${poolE[randE].answers[1]}\nC. ${poolE[randE].answers[2]}\nD. ${poolE[randE].answers[3]}\n`}
					)

				// Button row for answer choices
				const rowE = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('exam-extra-a')
							.setLabel('A')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-extra-b')
							.setLabel('B')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-extra-c')
							.setLabel('C')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('exam-extra-d')
							.setLabel('D')
							.setStyle(ButtonStyle.Primary),
					);

				// If question has figure attached, add to embed and send. If no figure, send out message
				if(poolE[randE].question.toUpperCase().includes('FIGURE E5-1')) {
					const file = new AttachmentBuilder('./resources/exams/E5-1.png');
					embedE.setImage('attachment://E5-1.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-1')) {
					const file = new AttachmentBuilder('./resources/exams/E6-1.png');
					embedE.setImage('attachment://E6-1.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-2')) {
					const file = new AttachmentBuilder('./resources/exams/E6-2.png');
					embedE.setImage('attachment://E6-2.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E6-3')) {
					const file = new AttachmentBuilder('./resources/exams/E6-3.png');
					embedE.setImage('attachment://E6-3.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-1')) {
					const file = new AttachmentBuilder('./resources/exams/E7-1.png');
					embedE.setImage('attachment://E7-1.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-2')) {
					const file = new AttachmentBuilder('./resources/exams/E7-2.png');
					embedE.setImage('attachment://E7-2.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E7-3')) {
					const file = new AttachmentBuilder('./resources/exams/E7-3.png');
					embedE.setImage('attachment://E7-3.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-1')) {
					const file = new AttachmentBuilder('./resources/exams/E9-1.png');
					embedE.setImage('attachment://E9-1.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-2')) {
					const file = new AttachmentBuilder('./resources/exams/E9-2.png');
					embedE.setImage('attachment://E9-2.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else if(poolE[randE].question.toUpperCase().includes('FIGURE E9-3')) {
					const file = new AttachmentBuilder('./resources/exams/E9-3.png');
					embedE.setImage('attachment://E9-3.png');
					let sent = await channel.send({ embeds: [embedE], files: [file], components: [rowE] });
					idExtra = sent.id;
				} else {
					let sent = await channel.send({ embeds: [embedE], components: [rowE] });
					idExtra = sent.id;
				}

				// Add current question id to storage to be able to fetch id to close the question
				const today = new Date().toISOString().slice(0, 10)
				questions.push({'date': today, 'idTech': idTech, 'idGeneral': idGeneral, 'idExtra': idExtra})
				fs.writeFile('./resources/exams/questions.json', JSON.stringify(questions, null, 2), function writeJSON(error) {
					if(error) {
						signale.error(error);
					}
					JSON.stringify(questions, null, 2);
				});
			} catch(error) {
				signale.error(error);
			}
		});

		// Start scheduled script
		job.start();
	},

	// Handle button press answers
	answers: function(interaction) {
		// Load records and get today's date
		var poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
		var poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
		var poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));
		var answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));
		const today = new Date().toISOString().slice(0, 10)

		// Get button press information
		var user = interaction.user.id;
		var name = interaction.guild.members.cache.find(member => member.id === interaction.user.id).displayName;
		var pool = interaction.customId.split('-')[1];
		var answer = interaction.customId.split('-')[2];

		// Find question the button was pressed on
		var fields = interaction.message.embeds[0].fields;
		var question = '';
		for(var i = 0; i < fields.length; i++) {
			if(fields[i].name == 'Question') {
				question = fields[i].value.split(']')[0].split('[')[1];
			}
		}

		// Find the correct answer choice
		var answerChoices = ['a', 'b', 'c', 'd']
		var answerCorrect = '';
		if(question[0] == 'T') {
			for(var i = 0; i < poolT.length; i++) {
				if(poolT[i].id == question) {
					answerCorrect = answerChoices[poolT[i].correct];
				}
			}
		} else if(question[0] == 'G') {
			for(var i = 0; i < poolG.length; i++) {
				if(poolG[i].id == question) {
					answerCorrect = answerChoices[poolG[i].correct];
				}
			}
		} else if(question[0] == 'E') {
			for(var i = 0; i < poolE.length; i++) {
				if(poolE[i].id == question) {
					answerCorrect = answerChoices[poolE[i].correct];
				}
			}
		} else {
			signale.debug(`Unknown question [${question}] answered`);
		}

		// Find user if they have answered in the past
		var index = -1;
		for(var i = 0; i < answers.length; i++) {
			if(answers[i].id == user) {
				index = i;
				break;
			}
		}

		if(index != -1) {
			// If they have answered in the past, update username if it was unknown
			if(answers[i].nickname != name) {
				answers[i].nickname = name;
			}

			// Find answer for today if it exists and modify, otherwise add new answer record
			var answerList = answers[i].answers;
			var prevAnswered = false;
			for(var i = 0; i < answerList.length; i++) {
				if(answerList[i].date === today && answerList[i].pool == pool && answerList[i].question == question) {
					if(answerList[i].answer != answer) {
						answerList[i].answer = answer;
					}
					prevAnswered = true;
				}
			}
			if(!prevAnswered) {
				answerList.push({'date': today, 'pool': pool, 'question': question, 'answerCorrect': answerCorrect, 'answer': answer})
			}
		} else {
			// If never answered, add new player
			answers.push({'id': user, 'nickname': name, 'correct': 0, 'answered': 0, 'answers': [{'date': today, 'pool': pool, 'question': question, 'answerCorrect': answerCorrect, 'answer': answer}]})
		}

		// Write changes to answer storage
		fs.writeFile('./resources/exams/answers.json', JSON.stringify(answers, null, 2), function writeJSON(error) {
			if(error) {
				signale.error(error);
			}
			JSON.stringify(answers, null, 2);
		});
		
		// Update player with confirmation message
		interaction.reply({ content: `Answer ${answer.toUpperCase()} recorded for question [${question}]`, ephemeral: true })
	},

	// Update number of correct answers for each player
	updateCorrect: async function() {
		// Load answer file
		var answers = JSON.parse(fs.readFileSync('./resources/exams/answers.json', 'utf8'));

		// For each player, tally number of correct answers and modify attribute
		for(var i = 0; i < answers.length; i++) {
			var correct = 0;
			for(var j = 0; j < answers[i].answers.length; j++) {
				if(answers[i].answers[j].answer == answers[i].answers[j].answerCorrect) {
					correct++;
				}
			}
			answers[i].answered = answers[i].answers.length;
			answers[i].correct = correct;
		}

		// Write changes to answer file
		fs.writeFile('./resources/exams/answers.json', JSON.stringify(answers, null, 2), function writeJSON(error) {
			if(error) {
				signale.error(error);
			}
			JSON.stringify(answers, null, 2);
		});
	}
   };
