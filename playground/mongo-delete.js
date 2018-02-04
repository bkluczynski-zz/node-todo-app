const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) return console.log('unable to connect to db');
  console.log('Connected to DB');
  db.collection('Todos').findOneAndDelete({ text: 'Someting to do' }).then((res) => {
    console.log(res);
  });
  db.close();
});
