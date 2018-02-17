const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
  },
];

const todo = {
  _id: new ObjectID(),
  text: 'Lonely todo',
}

beforeEach((done) => {
  Todo.remove({}).then(() => Todo.insertMany(todos)).then(() => done());
});


describe('POST/todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) { return done(err); }
        return Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not allow to create a todo with invalid data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET/todos', () => {
  it('should get all Todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
  it('should get a single doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('should return 404 if todo was not found', (done) => {
    request(app)
      .get(`/todos/${todo._id.toHexString()}`)
      .expect(404)
      .end(done);
  });
  it('should return 404 for invalid ObjectID', (done) => {
    request(app)
      .get('/todos/invalid_object_id-123-123')
      .expect(404)
      .end(done);
  });
});
