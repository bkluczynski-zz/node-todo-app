const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, e => res.status(400).send(e));
});

app.get('/todos', (req, res) => {
  Todo.find().then((result) => {
    res.send(result);
    console.log('result');
  }, e => console.log(e));
})


app.listen(3000, () => {
  console.log('listen on port 3000');
});

module.exports = {
  app,
};
