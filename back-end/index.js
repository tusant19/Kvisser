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
import bcrypt from 'bcrypt';

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
  for(let player of getPlayers.iterate(room, "host")) {
    let pSocId = player.socket_id
    console.log(pSocId)
    let connected = io.sockets.adapter.sids.has(pSocId);
    console.log(connected)
    if (!connected) {
      inactivePlayerSocIds.push(pSocId)
    }
  }
  for (let i = 0; i < inactivePlayerSocIds.length; i++) {
    console.log("marked inactive: " + inactivePlayerSocIds[i])
    markPlayerInactive.run(inactivePlayerSocIds[i]);
  }
  let playerCount = getPlayerCount.all(room);
  console.log(playerCount)

  let host = getHostUuid.get(room);
  if (host == undefined || host.socket_id == undefined || !io.sockets.adapter.sids.has(host.socket_id)) {
    gameInactive.run(room);
  }

  io.to(room).emit("playerCount", playerCount[0]['COUNT(*)'])
  sendPlayersToHost(room);
};

function sendPlayersToHost(room) {
  let players = getPlayers.all(room, "host")
  console.log("hostRoom " + room)
  console.log("players" + players)
  console.log("allPlayers")
  for (let player of getAllPlayers.iterate()) {
    console.log(player)
  }
  let sanitizedPlayers = []
  for (let i = 0; i < players?.length; i++) {
    sanitizedPlayers.push({"name": players[i]?.name})
  }
  io.to(room + "host").emit("updatePlayers", sanitizedPlayers);
}

io.on("connection", (socket) => {
  console.log("connect");
  socket.on("joinRoom", (room, uuid) => {
    console.log("joinRoom: " + room)
    socket.join(room);
    updateSocket.run(socket.id, 1, uuid)

    setInactivePlayers(room);
  });
  socket.on("joinRoomAsHost", (roomCode, uuid) => {
    socket.join(roomCode + "host")
    updateSocket.run(socket.id, 1, uuid)
    sendPlayersToHost(roomCode);
  })
  socket.on("disconnect", () => {
    console.log("disconnect");
    let player = getPlayerBySocket.all(socket.id)
    if (player[0] != undefined) {
      let room = player[0]?.game_code
      setInactivePlayers(room);
    }
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
    public_uuid TEXT,
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
    connected INTEGER,
    role TEXT
  );
`); 

db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    type TEXT,
    order_number INTEGER,
    img_link TEXT,
    score_value INTEGER,
    time_given INTEGER,
    title TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_uuid TEXT,
    name TEXT,
    password TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT,
    expiry INTEGER
  );
`);



const quizInsert = db.prepare('INSERT INTO quizzes (user_id, public_uuid, play_count, time_created, title, img_link, language, private) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const realQuizDelete = db.prepare('DELETE FROM quizzes WHERE id = ?');
const quizDelete = db.prepare('DELETE FROM quizzes WHERE user_id = -1')
const quizGet = db.prepare('SELECT * FROM quizzes WHERE id = ? LIMIT 1');
const quizGetByUuid = db.prepare('SELECT * FROM quizzes WHERE public_uuid = ? LIMIT 1');

const gameInsert = db.prepare('INSERT INTO games (user_id, room_code, capacity, active) VALUES (?, ?, ?, ?)');
const gameDelete = db.prepare('DELETE FROM games WHERE user_id = -1');
const gameCheck = db.prepare('SELECT * FROM games WHERE room_code = ? AND active = 1 LIMIT 1');
const gameInactive = db.prepare('UPDATE games SET active = 0 WHERE room_code = ?');

const playerInsert = db.prepare('INSERT INTO game_players (game_id, game_code, time_joined, user_id, uuid, name, score) VALUES (?, ?, ?, ?, ?, ?, ?)');
const getPlayer = db.prepare('SELECT * FROM game_players WHERE uuid = ? ORDER BY time_joined DESC')
const getPlayerBySocket = db.prepare('SELECT * FROM game_players WHERE socket_id = ? ORDER BY time_joined DESC LIMIT 1')
const deletePlayerBySocket = db.prepare('DELETE FROM game_players WHERE socket_id = ?')
const getPlayerCount = db.prepare('SELECT COUNT(*) FROM game_players WHERE game_code = ? AND connected = 1 AND role != \'host\'')
const getPlayers = db.prepare('SELECT * FROM game_players WHERE game_code = ? AND connected = 1 AND role != ? ORDER BY time_joined ASC')
const hostInsert = db.prepare('INSERT INTO game_players (game_id, game_code, time_joined, user_id, uuid, name, score, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const getHostUuid = db.prepare('SELECT * FROM game_players WHERE game_code = ? AND role = \'host\' ORDER BY time_joined DESC LIMIT 1')
const setAsPlayerByUuid = db.prepare('UPDATE game_players SET role = ? WHERE uuid = ?')
const setAsPlayerByName = db.prepare('UPDATE game_players SET role = ? WHERE name = ?')

const markPlayerInactive = db.prepare('UPDATE game_players SET connected = 0 WHERE socket_id = ?')
const updateSocket = db.prepare('UPDATE game_players SET socket_id = ?, connected = ? WHERE id = (SELECT id FROM game_players WHERE uuid = ? ORDER BY time_joined DESC LIMIT 1)')

const questionInsert = db.prepare('INSERT INTO quiz_questions (quiz_id, type, order_number, img_link, score_value, time_given, title) VALUES (?, ?, ?, ?, ?, ?, ?)');
const questionDelete = db.prepare('DELETE FROM quiz_questions WHERE id = ?');
const questionDeleteByQuiz = db.prepare('DELETE FROM quiz_questions WHERE quiz_id = ?');
const getQuestions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_number ASC')
const getQuestion = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? AND order_number = ? LIMIT 1')
const getQuestionById = db.prepare('SELECT * FROM quiz_questions WHERE id = ? LIMIT 1')

const userInsert = db.prepare('INSERT INTO users (name, public_uuid, password) VALUES (?, ?, ?)');
const getUserByName = db.prepare('SELECT * FROM users WHERE name = ? LIMIT 1'); 
const tokenInsert = db.prepare('INSERT INTO sessions (user_id, token, expiry) VALUES (?, ?, ?)');
const getUserIdByToken = db.prepare('SELECT * FROM sessions WHERE token = ? LIMIT 1');
const updateUserPassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');
const deleteSessionByToken = db.prepare('DELETE FROM sessions WHERE token = ?');
const getuserById = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')

//debug   v
const getAllQuizzes = db.prepare('SELECT * FROM quizzes')
const getAllSessions = db.prepare('SELECT * FROM sessions')
const getAllPlayers = db.prepare('SELECT * FROM game_players')

//queries ^

const saltRounds = 10;

//auth
function checkQuizAccess(req, res, next) {
  let testUuid = "abcd";
  let secretTestUuid = "abdc"
  
  
  quizInsert.run(-1, testUuid, 0, Date.now(), "Example quiz!", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(1, secretTestUuid, 0, Date.now(), "Secret example quiz!", "https://placehold.co/800x400", "english", 1);
  let quiz = quizGetByUuid.all(req.params.uuid);
  questionInsert.run(quiz[0]?.id, "multipleChoice", 1, "https://placehold.co/600x400", 10, 30, "Question 1");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 2, "https://placehold.co/600x400", 10, 30, "Question 2");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 3, "https://placehold.co/600x400", 10, 30, "Question 3");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 4, "https://placehold.co/600x400", 10, 30, "Question 4");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 5, "https://placehold.co/600x400", 10, 30, "Question 5");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 6, "https://placehold.co/600x400", 10, 30, "Question 6");
  questionInsert.run(quiz[0]?.id, "multipleChoice", 7, "https://placehold.co/600x400", 10, 30, "Question 8");

  if (quiz.length === 0) {
    return res.sendStatus(404);
  }
  console.log(quiz[0].private)
  if (quiz[0]?.private == 0) {
    return next();
  }

  let token = req?.cookies?.sessionToken
  console.log(token)
  if (token === null  || token === undefined) {
    return res.sendStatus(404);
  }
  let user = getUserIdByToken.all(token);
  if (user.expiry < Date.now()) {
    return res.sendStatus(404);
  }
  let userId = user[0]?.user_id
  if (userId === null || userId === undefined) {
    return res.sendStatus(404);
  }
  console.log(quiz[0]?.user_id)
  console.log(userId)
  if(quiz[0]?.user_id == userId) {
    return next();
  } else {
    return res.sendStatus(404)
  }

}

app.put('/v1/register', async (req, res) => {
  let user = getUserByName.get(req.body?.name);
  if (user?.id != undefined) {
    res.status(401)
    return res.json(
      {
        error: "Username is taken"
      }
    )
  }
  let name = req.body?.name;
  let password = req.body?.password; 
  bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
      res.sendStatus(500)
    } else {
      userInsert.run(name, uuidv4(), hash);
      let token = uuidv4();
      console.log(token)
      let expiry = Date.now() + 3600000 * 24 * 7; // 1 week
      tokenInsert.run(user?.id, token, expiry);
      res.cookie('sessionToken', token, { maxAge: (3600000 * 24 * 7), httpOnly: true })
      res.sendStatus(200)
    }
  });
}); 

app.put('/v1/login', (req, res) => {
  console.log("login received")
  let name = req.body?.name;
  let password = req.body?.password; 
  console.log(name)
  console.log(password)
  let user = getUserByName.get(name);
  console.log(user)
  bcrypt.compare(password, user?.password, function(err, result) {
    if (result) {
        console.log("s login")
        let token = uuidv4();
        console.log(token)
        let expiry = Date.now() + 3600000 * 24 * 7; // 1 week
        tokenInsert.run(user?.id, token, expiry);
        res.cookie('sessionToken', token, { maxAge: (3600000 * 24 * 7), httpOnly: true })
        res.sendStatus(200)
    }
    else if (!result) {
        res.status(404)
        res.json(
          {
            error: "Wrong username or password"
          }
        )
      }
    else if (err) {
      res.status(500)
      res.json(
        {
          error: "A server error occured"
        }
      )
    }
  });
});

app.put('/v1/changepassword', (req, res) => {
  let name = req.body?.name;
  let password = req.body?.password;
  let newPassword = req.body?.newPassword;
  let user = getUserByName.get(name);
  if (user?.id == undefined) {
    res.status(401)
    res.json(
      {
        error: "Wrong username or password"
      }
    )
  }
  bcrypt.compare(password, user?.password, function(err, result) {
    if (result) {
      bcrypt.hash(newPassword, saltRounds, function(err, hash) {
        if (err) {
          res.status(500)
          res.json(
            {
              error: "A server error occured"
            }
          )
        } else {
          // new Session copypaste
          updateUserPassword.run(hash, user?.id);
          let token = uuidv4();
          console.log(token)
          let expiry = Date.now() + 3600000 * 24 * 7; // 1 week
          tokenInsert.run(user?.id, token, expiry);
          res.cookie('sessionToken', token, { maxAge: (3600000 * 24 * 7), httpOnly: true })
          res.sendStatus(200)
        }
      });
    }
    else if (!result) {
        res.status(401)
        res.json(
          {
            error: "Wrong username or password"
          }
        )
    }
    else if (err) {
      res.status(500)
      res.json(
        {
          error: "A server error occured"
        }
      )
    }
    else {
      res.status(500)
      res.json(
        {
          error: "A server error occured"
        }
      )
    }
  });
});    

app.get('/v1/loginstatus', (req, res) => {
  let token = req?.cookies?.sessionToken
  console.log(token)
  if (token == undefined || token == null) {
    res.status(401)
    return res.json(
      {
        msg: "Log in"
      }
    )
  }
  let exists = getUserIdByToken.all(token)
  if (exists[0]?.id != undefined && exists[0]?.expiry > Date.now()) {
    res.status(200)
    return res.json(
      {
        msg: "Log out"
      }
    )
  } else {
    res.status(401)
    return res.json(
      {
        msg: "Log in"
      }
    )
  }
});

app.put('/v1/logout', (req, res) => {
  let token = req?.cookies?.sessionToken
  if (token == undefined || token == null) {
    res.status(401)
    return res.json(
      {
        error: "Not logged in"
      }
    )
  }
  let user = getUserIdByToken.all(token)
  if (user[0]?.id == undefined) {
    res.status(401)
    return res.json(
      {
        error: "Not logged in"
      }
    )
  }
  deleteSessionByToken.run(token);
  res.clearCookie('sessionToken');
  res.sendStatus(200)
});

//main
app.get('/v1/mostPlayed', (req, res) => {
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "1", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "2", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "3", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "4", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "5", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "6", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "7", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "8", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "9", "https://placehold.co/600x400", "english", 0);

  const getMostPlayed = db.prepare('SELECT * FROM quizzes WHERE private != 1 ORDER BY play_count DESC LIMIT 30');
  let sanitizedMostPlayed = []
  for (let quiz of getMostPlayed.all()) {
    sanitizedMostPlayed.push({"title": quiz.title, "img_link": quiz.img_link, "uuid": quiz.public_uuid})
  }

  res.send(sanitizedMostPlayed)

  quizDelete.run();
});

app.put('/v1/joinRoom', async (req, res) => {
  let caseUpperCode = req?.body?.code?.toLowerCase();
  let alrInRoom = false;
  if (caseUpperCode != null && req.body.name != null && caseUpperCode != "" && req.body.name != "") {
    if (req?.body?.name?.length > 30) {
      return res.sendStatus(422);
    }
    for (let game of getPlayer.iterate(req?.cookies?.playerUuid)) {
      console.log("BODY code" + req.body?.code)
      let active = gameCheck.all(game?.game_code)
      console.log("result" + active[0]?.active)
      if (active[0]?.active == 1) {
        alrInRoom = true;
      }
    }
    



    
    let gameExists = gameCheck.all(caseUpperCode);
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
        let playerId = 0;
        let token = req?.cookies?.sessionToken
        if (token != null && token != undefined) {
          let user = getUserIdByToken.all(token);
          playerId = user[0]?.user_id
        }
        let name = req.body.name + "-" + uuid.slice(0,3)
        playerInsert.run(gameId, caseUpperCode, Date.now(), playerId, uuid, name, 0)
        setAsPlayerByName.run("player", name)
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
});

app.get('/v1/playerDetails', (req, res) => {
  console.log(req.cookies.playerUuid)
  let player = getPlayer.all(req.cookies.playerUuid)
  //console.log(player)
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

app.get('/v1/quiz/:uuid', checkQuizAccess, (req, res) => {
  let testUuid = "abcd";
  console.log(testUuid)
  
  let quiz = quizGetByUuid.all(req.params.uuid);
  
  let questions = getQuestions.all(quiz[0]?.id)
  let sanitizedQuestions = []
  for (let question of questions) {
    console.log("loop")
    sanitizedQuestions.push({"title": question.title, "question": question.img_link})
  }
  if (quiz[0] == undefined) {
    res.status(404).send("quiz not found")
  } else {
    res.json(
      {
        title: quiz[0]?.title,
        img_link: quiz[0]?.img_link,
        questions: sanitizedQuestions
      }
    )
    }

  quizDelete.run()
  questionDeleteByQuiz.run(testUuid)
});

function generateCode(len) {
  let code = '';
  for (let i = 0; i < len; i++) {
    let randNum = 97;
    randNum += (Math.floor(Math.random() * 25))
    console.log(randNum)
    code += (String.fromCharCode(randNum));
  }
  return code;
}

app.put('/v1/host/:uuid', checkQuizAccess, (req, res) => {
  console.log("host request received")
  let sessionToken = req?.cookies?.sessionToken
  let tokenUser = getUserIdByToken.all(sessionToken)
  let uuidGivenToClient;
  if (tokenUser[0]?.user_id != undefined) {
    let userUser = getuserById.all(tokenUser[0]?.user_id)
    uuidGivenToClient = userUser[0]?.public_uuid
  } else {
    uuidGivenToClient = uuidv4();
  }

  let gamecode = generateCode(6)
  let gameExists = gameCheck.all(gamecode);
  while (gameExists[0]?.active != undefined && gameExists[0]?.active != 0) {
    gamecode = generateCode(6)
    gameExists = gameCheck.all(gamecode);
  }
  
  gameInsert.run(uuidGivenToClient, gamecode, 100, 1);
  let game = gameCheck.all(gamecode);
  hostInsert.run(game[0]?.id, gamecode, Date.now(), uuidGivenToClient, uuidGivenToClient, "host", 0, "host");
  res.cookie('playerUuid', uuidGivenToClient, { maxAge: (3600000), httpOnly: true })
  res.status(200)
  res.json(
    {
      roomCode: gamecode,
      uuid: uuidGivenToClient
    }
  )
});

httpServer.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});