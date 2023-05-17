const mongoose = require('mongoose');

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

const answerSchema = new mongoose.Schema({
	'_id': String,
	'question': String,
	'answer': Number,
	'correct': Boolean
})

const playerSchema = new mongoose.Schema({
	'_id': String,
	'record_old': Map,
	'answers': [answerSchema]
})

const guildSchema = new mongoose.Schema({
	'_id': String,
	'question_id': String,
	'id_tech': String,
	'id_general': String,
	'id_extra': String,
	'exam_records': [playerSchema]
})
const Exam = mongoose.model('Exam-Daily-Question', guildSchema);

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

module.exports = {Config, Exam, Question};