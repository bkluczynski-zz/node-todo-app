const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');
const _ = require('lodash');


const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

const todo = {
  _id: new ObjectID(),
  text: 'Lonely todo',
};

beforeEach(populateTodos);
beforeEach(populateUsers);


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
describe('DELETE/todos/:id', () => {
  it('should delete a todo', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(todos[0]._id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });
  it('should return 404 if todo was not found', (done) => {
    request(app)
      .delete(`/todos/${todo._id.toHexString()}`)
      .expect(404)
      .end(done);
  });
  it('should return 404 for invalid ObjectID', (done) => {
    request(app)
      .delete('/todos/invalid_object_id-123-123')
      .expect(404)
      .end(done);
  });
});
describe('PATCH/todos/:id', () => {
  it('should change completed to true', (done) => {
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: true, text: 'I like cherries' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('I like cherries');
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });
  it('should change completed to false', (done) => {
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: false, text: 'I like bananas' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('I like bananas');
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('USERS', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should not return user if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
  it('should create a user', (done) => {
    request(app)
      .post('/users')
      .send({ email: 'myfancyemail@gmail.com', password: 'mypassword' })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.email).toBe('myfancyemail@gmail.com');
        expect(res.body._id).toExist();
      })
      .end((err) => {
        if (err) return done(err);

        User.findOne({ email: 'myfancyemail@gmail.com' }).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe('password')
          done();
        }).catch(e => done(e));
      });
  });
  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({ email: '123@gmail.com' })
      .expect(400)
      .end(done);
  });
  it('should not create the user if email is already in use', (done) => {
    request(app)
      .post('/users')
      .send({ email: users[0].email })
      .expect((res) => {
        expect(res.body.errors).toExist();
      })
      .end(done);
  });
});
describe('POST /users/login', () => {
  it('should allow to log in the user', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: users[0].email, password: users[0].password })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[0]._id).then((user) => {
          console.log('user.tokens', user.tokens.length);
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth'],
          });
          done();
        }).catch(e => done(e));
      });
  });
  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: 'someEmail@gmail.com', password: 'someInvalidPassword' })
      .expect(400)
      .end(done);
  });
});
