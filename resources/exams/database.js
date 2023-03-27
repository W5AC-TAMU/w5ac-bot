const fs = require('node:fs');
const signale = require('signale');
const mongoose = require('mongoose');

signale.config({displayTimestamp: true, displayDate: true});
mongoose.connect('mongodb://127.0.0.1:27017/w5ac-bot');

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

const poolT = JSON.parse(fs.readFileSync('./resources/exams/technician.json', 'utf8'));
const poolG = JSON.parse(fs.readFileSync('./resources/exams/general.json', 'utf8'));
const poolE = JSON.parse(fs.readFileSync('./resources/exams/extra.json', 'utf8'));

console.log(`Importing ${poolT.length + poolG.length + poolE.length} questions`);

poolT.forEach(question => {
	try {
		var question = new Question({'_id': question.id, 'correct': question.correct, 'question': question.question, 'answers': {0: question.answers[0], 1: question.answers[1], 2: question.answers[2], 3: question.answers[3]}});
		question.save();
	} catch(error) {
		signale.error(error);
	}
});

poolG.forEach(question => {
	try {
		var question = new Question({'_id': question.id, 'correct': question.correct, 'question': question.question, 'answers': {0: question.answers[0], 1: question.answers[1], 2: question.answers[2], 3: question.answers[3]}});
		question.save();
	} catch(error) {
		signale.error(error);
	}
});

poolE.forEach(question => {
	try {
		var question = new Question({'_id': question.id, 'correct': question.correct, 'question': question.question, 'answers': {0: question.answers[0], 1: question.answers[1], 2: question.answers[2], 3: question.answers[3]}});
		question.save();
	} catch(error) {
		signale.error(error);
	}
});

console.log("Imported all questions");
return 0;
