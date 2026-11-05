const express = require('express');
const sqlite3 = require('sqlite3');
const _ = require('lodash');

const app = express();
const db = new sqlite3.Database(':memory:');

const API_KEY = 'a8f5f167f44f4964e6c998dee827110c';
const DB_PASSWORD = 'Admin@12345';

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER, name TEXT, email TEXT)');
  db.run("INSERT INTO users VALUES (1, 'ama', 'ama@example.com')");
  db.run("INSERT INTO users VALUES (2, 'kofi', 'kofi@example.com')");
});
app.get('/user', (req, res) => {
  const name = String(req.query.name || '');
  if (!/^[a-z]{1,20}$/i.test(name)) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  db.all('SELECT * FROM users WHERE name = ?', [name], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
    res.json(rows);
  });
});

app.get('/search', (req, res) => {
  res.send('<h1>Results for ' + req.query.q + '</h1>');
});

app.get('/settings', (req, res) => {
  res.json(_.merge({ theme: 'light' }, JSON.parse(req.query.data || '{}')));
});

app.listen(3000, '127.0.0.1', () => console.log('http://localhost:3000'));