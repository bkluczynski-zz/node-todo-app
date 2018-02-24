const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
  },
];

const userObjectIdOne = new ObjectID();
const userObjectIdTwo = new ObjectID();

const users = [
  {
    _id: userObjectIdOne,
    email: 'bart@gmail.com',
    password: 'password89',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userObjectIdOne, access: 'auth' }, '123abc').toString(),
    }],
  },
  {
    _id: userObjectIdTwo,
    email: 'martin@gmail.com',
    password: 'differentPassword',
  },
];

const populateTodos = (done) => {
  Todo.remove({}).then(() =>
    Todo.insertMany(todos)).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const user1 = new User(users[0]).save();
    const user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };
