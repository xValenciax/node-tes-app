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
app.use(express.static('dist'));
app.use(express.json());
app.use(reqLogger);

app.get('/api/notes', (req, res) => {
	Note.find({}).then((notes) => {
		res.status(200).json(notes);
	});
});

app.get('/api/notes/:id', (req, res, next) => {
	const id = Number(req.params.id);
	Note.findById(id)
		.then((note) => {
			if (note) return res.status(200).json(note);
			res.status(404).json('note not found').end();
		})
		.catch((err) => next(err));
});

app.delete('/api/notes/:id', (req, res, next) => {
	const id = Number(req.params.id);
	Note.findByIdAndRemove(id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((err) => next(err));
});

app.post('/api/notes', (req, res) => {
	const body = req.body;
	if (!body.content)
		return res.status(400).json({
			error: 'content missing',
		});

	const note = new Note({
		content: body.content,
		important: body.important || false,
	});

	note.save().then((savedNote) => {
		res.status(200).json(savedNote);
	});
});

app.put('/api/notes/:id', (req, res, next) => {
	const id = req.params.id;
	const body = req.body;

	const note = {
		content: body.content,
		important: body.important,
	};

	Note.findByIdAndUpdate(id, note, {
		new: true,
		runValidators: true,
		context: 'query',
	})
		.then((updatedNote) => {
			res.json(updatedNote);
		})
		.catch((err) => next(err));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.log(error.message);

	if (error.name === 'CastError')
		return res.status(400).send({ error: 'malformed id' });

	if (error.name === 'ValidationError')
		return res.status(400).json({ error: error.message });

	next(error);
};

app.use(errorHandler);

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
