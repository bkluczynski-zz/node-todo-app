const mongoose = require('./db/mongoose');
const User = require('./models/user');
const Todo = require('./models/todo');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body);
});


app.listen(3000, () => {
  console.log('listen on port 3000');
});
