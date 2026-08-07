const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const db = new Database('test.db');

const corsOptions = {
    origin: ["http://localhost:5173", "http://192.168.68.100:5173"]
}

app.use(cors())
app.use(bodyParser.json());

db.exec(` 
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    play_count INTEGER,
    time_created INTEGER,
    title TEXT,
    img_link TEXT,
    private INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    room_code TEXT,
    capacity INTEGER,
    active INTEGER
  );
`); 

const quizInsert = db.prepare('INSERT INTO quizzes (user_id, play_count, time_created, title, img_link, private) VALUES (?, ?, ?, ? ,?, ?)');
const quizDelete = db.prepare('DELETE FROM quizzes WHERE user_id = -1')

const gameInsert = db.prepare('INSERT INTO games (user_id, room_code, capacity, active) VALUES (?, ?, ?, ?)');
const gameDelete = db.prepare('DELETE FROM games WHERE user_id = -1');

app.get('/v1/mostPlayed', (req, res) => {
  quizInsert.run(-1, 0, 0, "1", "https://placehold.co/600x400", 0);
  quizInsert.run(-1, 0, 0, "2", "https://placehold.co/900x400", 0);
  quizInsert.run(-1, 0, 0, "3", "https://placehold.co/300x400", 0);
  quizInsert.run(-1, 0, 0, "4", "https://placehold.co/600x400", 0);
  quizInsert.run(-1, 0, 0, "5", "https://placehold.co/900x400", 0);
  quizInsert.run(-1, 0, 0, "6", "https://placehold.co/300x400", 0);

  const getMostPlayed = db.prepare('SELECT * FROM quizzes WHERE private != 1 ORDER BY play_count DESC LIMIT 20');
  let mostPlayed = getMostPlayed.all();
  res.send(mostPlayed)

  quizDelete.run();
});

app.put('/v1/joinRoom', async (req, res) => {
  gameInsert.run(-1, "aaaa", 100, 1);
  if (req.body.code != null && req.body.name != null && req.body.code != "" && req.body.name != "") {
    const gameCheck = db.prepare('SELECT EXISTS(SELECT * FROM games WHERE room_code = ? AND active = 1 LIMIT 1) AS gameActive');
    let gameExists = gameCheck.all(req.body.code);
    if (gameExists[0].gameActive != 0) {
      res.sendStatus(200)
    }
    else {
      res.sendStatus(404)
    }
  } 
  else {
    res.sendStatus(422)
  }
  gameDelete.run();
});

app.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});