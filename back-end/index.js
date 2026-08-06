const express = require('express');
const app = express();
const cors = require('cors')
const Database = require('better-sqlite3');
const db = new Database('test.db');

const corsOptions = {
    origin: ["http://localhost:5173", "http://192.168.68.100:5173"]
}

app.use(cors())

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
    room_code INTEGER,
    capacity INTEGER,
    active INTEGER
  );
`); 

const quizInsert = db.prepare('INSERT INTO quizzes (user_id, play_count, time_created, title, img_link, private) VALUES (?, ?, ?, ? ,?, ?)');
const quizDelete = db.prepare('DELETE FROM quizzes WHERE user_id = -1')

const gameInsert = db.prepare('INSERT INTO games (room_code, capacity, active) VALUES (?, ?, ?)');

app.get('/', (req, res) => {
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

app.put('/joinRoom', (req, res) => {

});

app.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});