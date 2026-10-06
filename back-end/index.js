import express from 'express';
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
const db = new Database('test.db');
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import { Server } from "socket.io";

db.pragma('journal_mode = WAL');

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.68.100:5173", "https://kvisser.santtu.uk"],
    credentials: true
  }
});

function setInactivePlayers(room) {
  let inactivePlayerSocIds = [];
  for(let player of getPlayers.iterate(room)) {
    let pSocId = player.socket_id
    console.log(pSocId)
    let connected = io.sockets.adapter.sids.has(pSocId);
    console.log(connected)
    if (!connected) {
      inactivePlayerSocIds.push(pSocId)
    }
  }
  for (let i = 0; i < inactivePlayerSocIds.length; i++) {
    console.log("marked inactive: " + inactivePlayerSocIds[0])
    markPlayerInactive.run(inactivePlayerSocIds[i]);
  }
  let playerCount = getPlayerCount.all(room);
  console.log(playerCount)
  io.to(room).emit("playerCount", playerCount[0]['COUNT(*)'])
};

io.on("connection", (socket) => {
  console.log("connect");
  socket.on("joinRoom", (room, uuid) => {
    console.log("joinRoom: " + room)
    socket.join(room);
    updateSocket.run(socket.id, 1, uuid)

    setInactivePlayers(room);
  });
});


const corsOptions = {
    origin: ["http://localhost:5173", "http://192.168.68.100:5173", "https://kvisser.santtu.uk"],
    credentials: true
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(cookieParser())

db.exec(` 
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    play_count INTEGER,
    time_created INTEGER,
    title TEXT,
    img_link TEXT,
    language TEXT,
    private INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    room_code TEXT,
    capacity INTEGER,
    time_started INTEGER,
    current_question_number INTEGER,
    active INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_code INTEGER,
    game_id INTEGER,
    time_joined INTEGER,
    user_id INTEGER,
    uuid TEXT,
    name TEXT,
    score INTEGER,
    socket_id TEXT,
    connected INTEGER
  );
`); 

const quizInsert = db.prepare('INSERT INTO quizzes (user_id, play_count, time_created, title, img_link, language, private) VALUES (?, ?, ?, ? ,?, ?, ?)');
const quizDelete = db.prepare('DELETE FROM quizzes WHERE user_id = -1')

const gameInsert = db.prepare('INSERT INTO games (user_id, room_code, capacity, active) VALUES (?, ?, ?, ?)');
const gameDelete = db.prepare('DELETE FROM games WHERE user_id = -1');
const gameCheck = db.prepare('SELECT * FROM games WHERE room_code = ? AND active = 1 LIMIT 1');

const playerInsert = db.prepare('INSERT INTO game_players (game_id, game_code, time_joined, user_id, uuid, name, score) VALUES (?, ?, ?, ?, ?, ?, ?)');
const getPlayer = db.prepare('SELECT * FROM game_players WHERE uuid = ? ORDER BY time_joined DESC LIMIT 1')
const getPlayerBySocket = db.prepare('SELECT * FROM game_players WHERE socket_id = ? ORDER BY time_joined DESC LIMIT 1')
const deletePlayerBySocket = db.prepare('DELETE FROM game_players WHERE socket_id = ?')
const getPlayerCount = db.prepare('SELECT COUNT(*) FROM game_players WHERE game_code = ? AND connected = 1')
const getPlayers = db.prepare('SELECT * FROM game_players WHERE game_code = ? AND connected = 1')

const markPlayerInactive = db.prepare('UPDATE game_players SET connected = 0 WHERE socket_id = ?')
const updateSocket = db.prepare('UPDATE game_players SET socket_id = ?, connected = ? WHERE id = (SELECT id FROM game_players WHERE uuid = ? ORDER BY time_joined DESC LIMIT 1)')

app.get('/v1/mostPlayed', (req, res) => {
  quizInsert.run(-1, 0, 0, "1", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, 0, 0, "2", "https://placehold.co/900x400", "english", 0);
  quizInsert.run(-1, 0, 0, "3", "https://placehold.co/300x400", "english", 0);
  quizInsert.run(-1, 0, 0, "4", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, 0, 0, "5", "https://placehold.co/900x400", "english", 0);
  quizInsert.run(-1, 0, 0, "6", "https://placehold.co/300x400", "english", 0);
  quizInsert.run(-1, 0, 0, "7", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, 0, 0, "8", "https://placehold.co/900x400", "english", 0);
  quizInsert.run(-1, 0, 0, "9", "https://placehold.co/300x400", "english", 0);

  const getMostPlayed = db.prepare('SELECT * FROM quizzes WHERE private != 1 ORDER BY play_count DESC LIMIT 20');
  let mostPlayed = getMostPlayed.all();
  res.send(mostPlayed)

  quizDelete.run();
});

app.put('/v1/joinRoom', async (req, res) => {
  gameInsert.run(-1, "aaaa", 100, 1);
  let alrInRoom = false;
  if (req.body.code != null && req.body.name != null && req.body.code != "" && req.body.name != "") {
    for (let game of getPlayer.iterate(req?.cookies?.playerUuid)) {
      let active = gameCheck.all(req.body?.code)
      if (active[0].active) {
        alrInRoom = true;
      }
    }
    



    
    let gameExists = gameCheck.all(req.body.code);
    if (gameExists[0]?.active != undefined && gameExists[0]?.active != 0) {
      let gameId = gameExists[0].id;
      let uuid = null;
      if (req.cookies.playerUuid == null) {
        uuid = uuidv4();
        res.cookie('playerUuid', uuid, { maxAge: (3600000), httpOnly: true })
      }  else {
        
        uuid = req.cookies.playerUuid

      }
      if (alrInRoom !== true) {
        playerInsert.run(gameId, req.body.code, Date.now(), 0, uuid, (req.body.name + "-" + uuid.slice(0,3)), 0)
      }
      
      res.status(200)
      return res.json(
        {
          playerUuid: uuid
        }
      )
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

app.get('/v1/playerDetails', (req, res) => {
  console.log(req.cookies.playerUuid)
  let player = getPlayer.all(req.cookies.playerUuid)
  // console.log(player[0])
  if (player[0] == undefined) {
    res.sendStatus(404)
  } else {
    res.json(
      {
        name: player[0]?.name,
        score: player[0]?.score,
        room: player[0]?.game_code
      }
    )
  }
})

httpServer.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});