require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Note = require('./models/Note');

const app = express();

const reqLogger = (req, res, next) => {
	console.log('Method:', req.method);
	console.log('Path:  ', req.path);
	console.log('Body:  ', req.body);
	console.log('---');
	next();
};

app.use(cors());
app.use(express.json());
app.use(reqLogger);
app.use(express.static('dist'));

let notes = [
	{
		id: 1,
		content: 'HTML is easy',
		important: true,
	},
	{
		id: 2,
		content: 'Browser can execute only JavaScript',
		important: false,
	},
	{
		id: 3,
		content: 'GET and POST are the most important methods of HTTP protocol',
		important: true,
	},
];

app.get('/api/notes', (req, res) => {
	Note.find({}).then((notes) => {
		res.json(notes);
	});
});

app.get('/api/notes/:id', (req, res) => {
	const id = Number(req.params.id);
	const note = notes.find((note) => note.id === id);
	console.log(note);
	if (note) res.json(note);
	else {
		res.statusMessage = 'an Invalid Id is Provided';
		res.status(404).end();
	}
});

app.delete('/api/notes/:id', (req, res) => {
	const id = Number(req.params.id);
	notes = notes.filter((note) => note.id !== id);

	res.status(204).end();
});

const generateID = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
	return maxId + 1;
};

app.post('/api/notes', (req, res) => {
	const body = req.body;
	if (!body.content)
		return res.status(400).json({
			error: 'content missing',
		});

	const note = {
		content: body.content,
		important: body.important || false,
		id: generateID(),
	};
	console.log(note);

	notes = notes.concat(note);

	res.status(200).json(note);
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
