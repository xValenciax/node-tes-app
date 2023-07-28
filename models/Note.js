const mongoose = require('mongoose');

const url = process.env.MONGODB_URL;

mongoose.set('strictQuery', false);
mongoose
	.connect(url)
	.then((res) => {
		console.log('connected to MongoDB');
	})
	.catch((error) => {
		console.log('error connected');
	});

const noteSchema = new mongoose.Schema({
	content: String,
	important: Boolean,
});

noteSchema.set('toJSON', {
	transform: (document, returnedObj) => {
		returnedObj.id = returnedObj._id.toString();
		delete returnedObj._id;
		delete returnedObj._v;
	},
});

module.exports = mongoose.model('Note', noteSchema);
