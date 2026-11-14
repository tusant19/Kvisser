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
    //console.log(pSocId)
    let connected = io.sockets.adapter.sids.has(pSocId);
    //console.log(connected)
    if (!connected) {
      inactivePlayerSocIds.push(pSocId)
    }
  }
  for (let i = 0; i < inactivePlayerSocIds.length; i++) {
    //console.log("marked inactive: " + inactivePlayerSocIds[i])
    markPlayerInactive.run(inactivePlayerSocIds[i]);
  }
  let playerCount = getPlayerCount.all(room);
  //console.log(playerCount)

  let host = getHostUuid.get(room);
  let hostInactive = false;
  if (host == undefined || host.socket_id == undefined || !io.sockets.adapter.sids.has(host.socket_id)) {
    hostInactive = true;
  }
  if (hostInactive) {
    //wait 5 seconds to see if host reconnects
    setTimeout(() => {
      let host = getHostUuid.get(room);
      let hostInactive = false;
      if (host == undefined || host.socket_id == undefined || !io.sockets.adapter.sids.has(host.socket_id)) {
        hostInactive = true;
      }
      if (hostInactive) {
        // If the host is still inactive, mark the room as inactive
        console.log("host inactive, marking room as inactive: " + room)
        gameInactive.run(room);
      }
    }, 5000);
  }

  io.to(room).emit("playerCount", playerCount[0]['COUNT(*)'])
  sendPlayersToHost(room);
};

function sendPlayersToHost(room) {
  let players = getPlayers.all(room, "host")
  //console.log("hostRoom " + room)
  //console.log("players" + players)
  //console.log("allPlayers")
  for (let player of getAllPlayers.iterate()) {
    //console.log(player)
  }
  let sanitizedPlayers = []
  for (let i = 0; i < players?.length; i++) {
    sanitizedPlayers.push({"name": players[i]?.name})
  }
  io.to(room + "host").emit("updatePlayers", sanitizedPlayers);
}

io.on("connection", (socket) => {
  //console.log("connect");
  socket.on("joinRoom", (room, uuid) => {
    if (!room) return;
    if (!uuid) return;
    //console.log("joinRoom: " + room)
    socket.join(room);
    updateSocket.run(socket.id, 1, uuid)

    setInactivePlayers(room);
    //console.log("room joined " +  room)
  });
  socket.on("joinRoomAsHost", (roomCode, uuid) => {
    if (!roomCode) return;
    if (!uuid) return;
    socket.join(roomCode + "host")
    updateSocket.run(socket.id, 1, uuid)
    sendPlayersToHost(roomCode);
    
  })
  socket.on("nextQuestion", (roomCode, uuid) => {
    console.log("nextQuestion: " + roomCode)
    setInactivePlayers(roomCode)
    //console.log("nextQuestion: " + roomCode)
    let host = getHostUuid.get(roomCode);
    let questionCount = getQuestionCountByRoomCode.all((roomCode))
    let gameState = getGameState.get(roomCode)
    //console.log("gameState: " + gameState?.state)
    let game = gameCheck.all(roomCode)
    let questionType = getQuestionType.get(game[0]?.quiz_id, (Math.floor(gameState?.state / 2) + 1))
    //console.log("questionType: " + questionType?.type)
    if (host?.uuid == uuid) {
      //console.log("host is correct")
      if (gameState?.state < (questionCount[0]['COUNT(*)'] * 2)) {
        //console.log("gameState check pass")
        //console.log("emit " + roomCode)
        io.to(roomCode).to(roomCode + "host").emit("nextQuestionSwap", (questionType?.type));
        updapteGameState.run(gameState?.state + 2, roomCode)
        addGameStateChange.run(roomCode, gameState?.state + 2, Date.now());

      }
    }
  });
  socket.on("nextQuestionFromLeaderboard", (roomCode, uuid) => {
    console.log("nextQuestionFromLeaderboard: " + roomCode)
    socket.join(roomCode + "host");
    updateSocket.run(socket.id, 1, uuid);
    let host = getHostUuid.get(roomCode);
    let questionCount = getQuestionCountByRoomCode.all((roomCode))[0]['COUNT(*)'] * 2
    let gameState = getGameState.get(roomCode)
    let questionType = getQuestionTypeByRoomCodeAndOrder.get(roomCode, (Math.floor(gameState?.state / 2) + 1))
    if (host?.uuid == uuid) {
      if (gameState?.state < questionCount) {
        io.to(roomCode).to(roomCode + "host").emit("nextQuestionSwap", (questionType?.type));
        updapteGameState.run(gameState?.state + 2, roomCode)
        addGameStateChange.run(roomCode, gameState?.state + 2, Date.now());
      }
    }
  });
  socket.on("disconnect", () => {
    //console.log("disconnect");
    let player = getPlayerBySocket.all(socket.id)
    if (player[0] != undefined) {
      let room = player[0]?.game_code
      setInactivePlayers(room);
    }
  });
  socket.on("skipQuestion", (roomCode, uuid) => {
    console.log("skipQuestion: " + roomCode)
    let host = getHostUuid.get(roomCode);
    let questionCount = getQuestionCountByRoomCode.all((roomCode))[0]['COUNT(*)'] * 2
    let gameState = getGameState.get(roomCode);
    let questionType = getQuestionTypeByRoomCodeAndOrder.get(roomCode, (Math.floor(gameState?.state / 2) + 1))

    if (host?.uuid == uuid) {
      if (gameState?.state < questionCount) {
        io.to(roomCode).to(roomCode + "host").emit("skipQuestion", (questionType?.type));
        updapteGameState.run(gameState?.state + 2, roomCode)
        addGameStateChange.run(roomCode, gameState?.state + 2, Date.now());
      }
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
    quiz_id INTEGER,
    user_id INTEGER,
    room_code TEXT,
    capacity INTEGER,
    time_started INTEGER,
    state INTEGER,
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

db.exec(`
  CREATE TABLE IF NOT EXISTS answer_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    answer TEXT,
    order_number INTEGER,
    is_correct INTEGER
  );
`);

// is_correct 2 means late answer, 1 means correct, 0 means incorrect
db.exec(`
  CREATE TABLE IF NOT EXISTS game_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_code TEXT,
    question_id INTEGER,
    player_uuid TEXT,
    answer TEXT,
    answer_time INTEGER,
    is_correct INTEGER
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS game_state_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_code TEXT,
    state INTEGER,
    time_changed INTEGER
  );
`);



const quizInsert = db.prepare('INSERT INTO quizzes (user_id, public_uuid, play_count, time_created, title, img_link, language, private) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const realQuizDelete = db.prepare('DELETE FROM quizzes WHERE id = ?');
const quizDelete = db.prepare('DELETE FROM quizzes WHERE user_id = -1')
const quizGet = db.prepare('SELECT * FROM quizzes WHERE id = ? LIMIT 1');
const quizGetByUuid = db.prepare('SELECT * FROM quizzes WHERE public_uuid = ? LIMIT 1');
const getQuizByWordInTitle = db.prepare('SELECT * FROM quizzes WHERE title LIKE ? AND private = 0 LIMIT 50');

const gameInsert = db.prepare('INSERT INTO games (user_id, room_code, capacity, active, state) VALUES (?, ?, ?, ?, ?)');
const gameDelete = db.prepare('DELETE FROM games WHERE user_id = -1');
const gameCheck = db.prepare('SELECT * FROM games WHERE room_code = ? AND active = 1 LIMIT 1');
const gameInactive = db.prepare('UPDATE games SET active = 0 WHERE room_code = ?');
const getGameState = db.prepare('SELECT state FROM games WHERE room_code = ? LIMIT 1');
const updateQuizIdInGame = db.prepare('UPDATE games SET quiz_id = ? WHERE room_code = ?');
const updapteGameState = db.prepare('UPDATE games SET state = ? WHERE room_code = ?');

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
const updatePlayerScore = db.prepare('UPDATE game_players SET score = ? WHERE uuid = ?')
const getPlayersSortedScore = db.prepare('SELECT * FROM game_players WHERE game_code = ? AND connected = 1 AND role != \'host\' ORDER BY score DESC, time_joined ASC')
const getPlayersSortedScoreNoConnect = db.prepare('SELECT * FROM game_players WHERE game_code = ? AND role != \'host\' ORDER BY score DESC, time_joined ASC')
const getPlayersPlace = db.prepare('SELECT COUNT(*) FROM game_players WHERE game_code = ? AND connected = 1 AND role != \'host\' AND score > (SELECT score FROM game_players WHERE uuid = ? ORDER BY time_joined DESC LIMIT 1)')

const markPlayerInactive = db.prepare('UPDATE game_players SET connected = 0 WHERE socket_id = ?')
const updateSocket = db.prepare('UPDATE game_players SET socket_id = ?, connected = ? WHERE id = (SELECT id FROM game_players WHERE uuid = ? ORDER BY time_joined DESC LIMIT 1)')

const questionInsert = db.prepare('INSERT INTO quiz_questions (quiz_id, type, order_number, img_link, score_value, time_given, title) VALUES (?, ?, ?, ?, ?, ?, ?)');
const questionDelete = db.prepare('DELETE FROM quiz_questions WHERE id = ?');
const questionDeleteByQuiz = db.prepare('DELETE FROM quiz_questions WHERE quiz_id = ?');
const getQuestions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_number ASC')
const getQuestion = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? AND order_number = ? LIMIT 1')
const getQuestionById = db.prepare('SELECT * FROM quiz_questions WHERE id = ? LIMIT 1')
const getQuestionCountByRoomCode = db.prepare('SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = (SELECT quiz_id FROM games WHERE room_code = ? LIMIT 1)')
const getQuestionTypeByRoomCodeAndOrder = db.prepare('SELECT type FROM quiz_questions WHERE quiz_id = (SELECT quiz_id FROM games WHERE room_code = ? LIMIT 1) AND order_number = ? LIMIT 1')
const getQuestionType = db.prepare('SELECT type FROM quiz_questions WHERE quiz_id = ? AND order_number = ? LIMIT 1')
const getQuestionByRoomCodeAndOrder = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = (SELECT quiz_id FROM games WHERE room_code = ? LIMIT 1) AND order_number = ? LIMIT 1')

const userInsert = db.prepare('INSERT INTO users (name, public_uuid, password) VALUES (?, ?, ?)');
const getUserByName = db.prepare('SELECT * FROM users WHERE name = ? LIMIT 1'); 
const tokenInsert = db.prepare('INSERT INTO sessions (user_id, token, expiry) VALUES (?, ?, ?)');
const getUserIdByToken = db.prepare('SELECT * FROM sessions WHERE token = ? LIMIT 1');
const updateUserPassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');
const deleteSessionByToken = db.prepare('DELETE FROM sessions WHERE token = ?');
const getuserById = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')

const answerOptionInsert = db.prepare('INSERT INTO answer_options (question_id, answer, order_number, is_correct) VALUES (?, ?, ?, ?)');
const answerOptionInsertByQuizIdAndOrder = db.prepare('INSERT INTO answer_options (question_id, answer, order_number, is_correct) VALUES ((SELECT id FROM quiz_questions WHERE quiz_id = ? AND order_number = ? LIMIT 1), ?, ?, ?)');
const answerOptionDelete = db.prepare('DELETE FROM answer_options WHERE id = ?');
const answerOptionDeleteByQuestionId = db.prepare('DELETE FROM answer_options WHERE question_id = ?');
const getCorrectAnswerByQuestionId = db.prepare('SELECT * FROM answer_options WHERE question_id = ? AND is_correct = 1 LIMIT 1');
const getAnswerOptionsByQuestionId = db.prepare('SELECT * FROM answer_options WHERE question_id = ? ORDER BY order_number ASC');

const insertAnswerForPlayer = db.prepare('INSERT INTO game_answers (game_code, question_id, player_uuid, answer, is_correct, answer_time) VALUES (?, ?, ?, ?, ?, ?)');
const hasAnswered = db.prepare('SELECT * FROM game_answers WHERE game_code = ? AND question_id = ? AND player_uuid = ? LIMIT 1');
const updateCorrectnessForPlayer = db.prepare('UPDATE game_answers SET is_correct = ? WHERE game_code = ? AND question_id = ? AND player_uuid = ?');
const getCorrectnessForPlayer = db.prepare('SELECT is_correct FROM game_answers WHERE game_code = ? AND question_id = ? AND player_uuid = ? LIMIT 1');
const isCorrectAnswer = db.prepare('SELECT is_correct FROM game_answers WHERE game_code = ? AND player_uuid = ? ORDER BY answer_time DESC LIMIT 1');
const getAnswerCountForQuestion = db.prepare('SELECT COUNT(*) FROM game_answers WHERE game_code = ? AND question_id = ?');
const getAnswersForQuestion = db.prepare('SELECT * FROM game_answers WHERE game_code = ? AND question_id = ?');
const getLatestCorrectnessForPlayer = db.prepare('SELECT is_correct FROM game_answers WHERE game_code = ? AND player_uuid = ? ORDER BY answer_time DESC LIMIT 1');

const addGameStateChange = db.prepare('INSERT INTO game_state_changes (game_code, state, time_changed) VALUES (?, ?, ?)');
const getLatestGameStateChange = db.prepare('SELECT * FROM game_state_changes WHERE game_code = ? ORDER BY time_changed DESC LIMIT 1');

//debug   v
const getAllQuizzes = db.prepare('SELECT * FROM quizzes')
const getAllSessions = db.prepare('SELECT * FROM sessions')
const getAllPlayers = db.prepare('SELECT * FROM game_players')
const getAllAnswerOptions = db.prepare('SELECT * FROM answer_options')
const getAllGames = db.prepare('SELECT * FROM games')
const getMostRecentGame = db.prepare('SELECT * FROM games ORDER BY time_started DESC LIMIT 1')

//queries ^

let doesExampleQuizExist = getAllQuizzes.all();
if (doesExampleQuizExist.length < 1) {
  console.log("ran");
  let exampleQuizUuid = uuidv4();
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Secret example quiz!", "https://placehold.co/800x400", "english", 1);
  quizInsert.run(-1, exampleQuizUuid, 0, Date.now(), "Hostable Example quiz!", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 1", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 2", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 3", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 4", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 5", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 6", "https://placehold.co/600x400", "english", 0);
  quizInsert.run(-1, uuidv4(), 0, Date.now(), "Empty placeholder quiz 7", "https://placehold.co/600x400", "english", 0);
  let publicQuiz = quizGetByUuid.all(exampleQuizUuid);
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 1, "https://placehold.co/600x400", 1000, 30, "Question 1");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 2, "https://placehold.co/600x400", 1000, 30, "Question 2");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 3, "https://placehold.co/600x400", 1000, 30, "Question 3");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 4, "https://placehold.co/600x400", 1000, 30, "Question 4");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 5, "https://placehold.co/600x400", 1000, 30, "Question 5");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 6, "https://placehold.co/600x400", 1000, 30, "Question 6");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 7, "https://placehold.co/600x400", 1000, 30, "Question 7");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 8, "https://placehold.co/600x400", 1000, 30, "Question 8");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 9, "https://placehold.co/600x400", 1000, 30, "Question 9");
  questionInsert.run(publicQuiz[0]?.id, "multipleChoice", 10, "https://placehold.co/600x400", 1000, 30, "Question 10");

  for (let i = 1; i <= 10; i++) {
    answerOptionInsertByQuizIdAndOrder.run(publicQuiz[0]?.id, i, "Answer 1", 1, 1);
    answerOptionInsertByQuizIdAndOrder.run(publicQuiz[0]?.id, i, "Answer 2", 2, 0);
    answerOptionInsertByQuizIdAndOrder.run(publicQuiz[0]?.id, i, "Answer 3", 3, 0);
    answerOptionInsertByQuizIdAndOrder.run(publicQuiz[0]?.id, i, "Answer 4", 4, 0);
  }
}

const saltRounds = 10;

//auth
function checkQuizAccess(req, res, next) {
  let quiz = quizGetByUuid.all(req.params.uuid);

  if (quiz.length === 0) {
    return res.sendStatus(404);
  }
  //console.log(quiz[0].private)
  if (quiz[0]?.private == 0) {
    return next();
  }

  let token = req?.cookies?.sessionToken
  //console.log(token)
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
  //console.log(quiz[0]?.user_id)
  //console.log(userId)
  if(quiz[0]?.user_id == userId) {
    return next();
  } else {
    return res.sendStatus(404)
  }

}

function checkAccountAccess(req, res, next) {
  let token = req?.cookies?.sessionToken
  if (token === null  || token === undefined) {
    return res.sendStatus(401);
  }
  let userThatRequested = getUserIdByToken.all(token);
  if (userThatRequested.expiry < Date.now()) {
    return res.sendStatus(401);
  }
  let userIdOfRequester = userThatRequested[0]?.user_id
  if (userIdOfRequester === null || userIdOfRequester === undefined) {
    return res.sendStatus(401);
  }
  let requestedAccountUuid = req.params?.uuid
  let requestersAccount = getuserById.get(userIdOfRequester);
  if (requestersAccount?.uuid !== requestedAccountUuid) {
    return res.sendStatus(401);
  }
  return next();
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
      let newUser = getUserByName.get(name);
      let token = uuidv4();
      //console.log(token)
      let expiry = Date.now() + 3600000 * 24 * 7; // 1 week
      tokenInsert.run(newUser?.id, token, expiry);
      res.cookie('sessionToken', token, { maxAge: (3600000 * 24 * 7), httpOnly: true })
      res.sendStatus(200)
    }
  });
}); 

app.put('/v1/login', (req, res) => {
  //console.log("login received")
  let name = req.body?.name;
  let password = req.body?.password; 
  //console.log(name)
  //console.log(password)
  let user = getUserByName.get(name);
  //console.log(user)
  bcrypt.compare(password, user?.password, function(err, result) {
    if (result) {
        //console.log("s login")
        let token = uuidv4();
        //console.log(token)
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
          //console.log(token)
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
  //console.log(token)
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
    //console.log("User is logged in")
    let uuid = getuserById.get(exists[0]?.user_id)?.public_uuid
    console.log("User is logged in: " + uuid)
    return res.json(
      {
        msg: "Log out",
        uuid: uuid
      }
    )
  } else {
    res.status(401)
    return res.json(
      {
        msg: "Log in",
       
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
  const getMostPlayed = db.prepare('SELECT * FROM quizzes WHERE private != 1 ORDER BY play_count DESC LIMIT 30');
  let sanitizedMostPlayed = []
  for (let quiz of getMostPlayed.all()) {
    sanitizedMostPlayed.push({"title": quiz.title, "img_link": quiz.img_link, "uuid": quiz.public_uuid})
  }

  res.send(sanitizedMostPlayed)

});

app.put('/v1/joinRoom', async (req, res) => {
  let caseUpperCode = req?.body?.code?.toLowerCase();
  console.log("joinRoom " + caseUpperCode + " " + req?.body?.name)
  let alrInRoom = false;
  if (caseUpperCode != null && req.body.name != null && caseUpperCode != "" && req.body.name != "") {
    if (req?.body?.name?.length > 30) {
      return res.sendStatus(422);
    }
    for (let game of getPlayer.iterate(req?.cookies?.playerUuid)) {
      //console.log("BODY code" + req.body?.code)
      let active = gameCheck.all(game?.game_code)
      //console.log("result" + active[0]?.active)
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
      console.log("game not found")
      console.log(gameExists)
      let mostRecentGame = getMostRecentGame.all();
      console.log(mostRecentGame)
      res.sendStatus(404)
    }
  } 
  else {
    res.sendStatus(422)
  }
});

app.get('/v1/playerDetails', (req, res) => {
  //console.log(req.cookies.playerUuid)
  let player = getPlayer.all(req.cookies.playerUuid)
  ////console.log(player)
  // //console.log(player[0])
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
  //console.log(testUuid)
  
  let quiz = quizGetByUuid.all(req.params.uuid);
  
  let questions = getQuestions.all(quiz[0]?.id)
  let sanitizedQuestions = []
  for (let question of questions) {
    //console.log("loop")
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

});

function generateCode(len) {
  let code = '';
  for (let i = 0; i < len; i++) {
    let randNum = 97;
    randNum += (Math.floor(Math.random() * 25))
    //console.log(randNum)
    code += (String.fromCharCode(randNum));
  }
  return code;
}

app.put('/v1/host/:uuid', checkQuizAccess, (req, res) => {
  console.log("host request received" + req.params?.uuid + " " + req?.cookies?.sessionToken)
  //console.log("host request received")
  let sessionToken = req?.cookies?.sessionToken
  let tokenUser = sessionToken ? getUserIdByToken.all(sessionToken) : []
  let uuidGivenToClient;
  if (tokenUser[0]?.user_id !== undefined) {
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
  
  gameInsert.run(uuidGivenToClient, gamecode, 100, 1, 0);
  let quiz = quizGetByUuid.all(req.params?.uuid);
  updateQuizIdInGame.run(quiz[0]?.id, gamecode);
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

app.get('/v1/question/:roomCode', (req, res) => {
  let currentQuestionNumber = getGameState.get(req.params?.roomCode)
  if (currentQuestionNumber?.state == undefined) {
    return res.sendStatus(404)
  }
  let question = getQuestionByRoomCodeAndOrder.all(req.params?.roomCode, Math.floor(currentQuestionNumber?.state / 2));
  let sanitizedQuestion = []
  if (question[0] != undefined) {
    sanitizedQuestion.push({
      title: question[0]?.title,
      img_link: question[0]?.img_link,
      score_value: question[0]?.score_value,
      time_given: question[0]?.time_given,
      type: question[0]?.type,
    })
  } else {
    return res.sendStatus(404)
  }
  console.log("question id: " + question[0]?.id)
  let answerOptions = getAnswerOptionsByQuestionId.all(question[0]?.id)
  let sanitizedAnswerOptions = []
  for (let i = 0; i < answerOptions?.length; i++) {
    sanitizedAnswerOptions.push({
      answer: answerOptions[i]?.answer,
      order_number: answerOptions[i]?.order_number,
    })
  }
  return res.json(
    {
      question: sanitizedQuestion[0],
      answerOptions: sanitizedAnswerOptions
    }
  )
});

httpServer.listen(8080, () => {
  //console.log(`Server listening on port 8080`);
});

app.get('/v1/role', (req, res) => {
  let player = getPlayer.all(req.cookies.playerUuid)
  if (player[0] == undefined) {
    res.sendStatus(404)
  } else {
    res.json(
      {
        role: player[0]?.role
      }
    )
  }
})

app.put('/v1/answer/:roomCode', (req, res) => {
  let player = getPlayer.all(req.cookies.playerUuid)
  if (player[0] == undefined) {
    return res.sendStatus(404)
  }
  let orderNumber = req.body?.order_number
  let question = getQuestionByRoomCodeAndOrder.all(req.params?.roomCode, Math.floor(getGameState.get(req.params?.roomCode)?.state / 2));
  if (question[0] == undefined) {
    return res.sendStatus(404)
  }
  let hasAlreadyAnswered = hasAnswered.get(req.params?.roomCode, question[0]?.id, player[0]?.uuid)
  if (hasAlreadyAnswered != undefined) {
    return res.sendStatus(409)
  }
  insertAnswerForPlayer.run(req.params?.roomCode, question[0]?.id, player[0]?.uuid, orderNumber, 0, Date.now())
  let correctAnswer = getCorrectAnswerByQuestionId.get(question[0]?.id)
  console.log("roomCode: " + req.params?.roomCode)
  let answerCount = getAnswerCountForQuestion.get(req.params?.roomCode, question[0]?.id)['COUNT(*)']
  console.log("answerCount: " + answerCount)
  io.to(req.params?.roomCode + "host").emit("answerCount", answerCount)
  io.to(req.params?.roomCode).emit("answerCount", answerCount)
  let questionStartTime = getLatestGameStateChange.get(req.params?.roomCode)
  questionStartTime = questionStartTime?.time_changed
  let timeTaken = Date.now() - questionStartTime
  let leftOverTime = question[0]?.time_given * 1000 - timeTaken
  let leftOverTimeSeconds = leftOverTime / 1000
  console.log("leftOverTime: " + leftOverTime)
  console.log("timeTaken: " + timeTaken)
  let didNotAnswerInTime = false
  if (timeTaken > question[0]?.time_given * 1000) {
    didNotAnswerInTime = true
  }
  if (didNotAnswerInTime) {
    updateCorrectnessForPlayer.run(2, req.params?.roomCode, question[0]?.id, player[0]?.uuid)
    res.status(200)
    return res.json(
      {
        correct: false,
        didNotAnswerInTime: true
      }
    )
  }
  if (correctAnswer && correctAnswer.order_number === orderNumber && player[0]?.role !== "host" && question[0]?.type === "multipleChoice" && question[0]?.score_value != undefined && question[0]?.score_value != null && question[0]?.score_value > 0) {
    console.log("points to give: " + Math.floor(leftOverTimeSeconds * question[0]?.score_value / question[0]?.time_given))
    updatePlayerScore.run(player[0]?.score + Math.floor(leftOverTimeSeconds * question[0]?.score_value / question[0]?.time_given), player[0]?.uuid)
    updateCorrectnessForPlayer.run(1, req.params?.roomCode, question[0]?.id, player[0]?.uuid)
    res.status(200)
    return res.json(
      {
        correct: true,
        newScore: player[0]?.score + question[0]?.score_value
      }
    )
  }
  res.status(200)
  return res.json(
    {
      correct: false
    }
  )
});

app.get('/v1/answerstatus/:roomCode', (req, res) => {
  let roomCode = req.params?.roomCode
  let player = getPlayer.all(req.cookies.playerUuid)
  if (player[0] == undefined) {
    return res.sendStatus(404)
  }
  if (player[0]?.role === "host") {
    return res.sendStatus(403)
  }
  let answer = isCorrectAnswer.all(req.params?.roomCode, player[0]?.uuid)
  if (answer == undefined) {
    return res.sendStatus(404)
  }
  let correctTrueFalse = answer[0]?.is_correct
  if (correctTrueFalse == 1) {
    correctTrueFalse = true
  } else {
    correctTrueFalse = false
  }
  let placeOnLeaderboard = getPlayersPlace.get(req.params?.roomCode, player[0]?.uuid)
  placeOnLeaderboard = placeOnLeaderboard['COUNT(*)'] + 1
  if (placeOnLeaderboard == undefined && placeOnLeaderboard == null) {
    return res.sendStatus(404)
  }
  let leaderboard = getPlayersSortedScore.all(req.params?.roomCode)
  let pointsToPersonAhead = leaderboard[placeOnLeaderboard - 2]?.score - leaderboard[placeOnLeaderboard - 1]?.score
  let personAheadName = leaderboard[placeOnLeaderboard - 2]?.name
  if (pointsToPersonAhead == undefined && pointsToPersonAhead == null) {
    pointsToPersonAhead = 0
  }
  let placeMsg = ""
  if (placeOnLeaderboard <= 5) {
    placeMsg = "You're on the leaderboard!"
  } else {
    placeMsg = `You're in ${placeOnLeaderboard}th place. ${pointsToPersonAhead} points behind ${personAheadName}.`
  }
  let ranOutOfTime = false;
    let correctness = getLatestCorrectnessForPlayer.get(roomCode, player[0]?.uuid)
    console.log("correctness: " + correctness);
    if (correctness?.is_correct > 1) {
      ranOutOfTime = true;
    }
  console.log("correctTrueFalse: " + correctTrueFalse)
  console.log("placeOnLeaderboard 3: " + placeOnLeaderboard)
  console.log("placeMsg: " + placeMsg)
  console.log("ranOutOfTime: " + ranOutOfTime)
  return res.json({
    msg: placeMsg,
    ranOutOfTime: ranOutOfTime,
    status: correctTrueFalse
  })
});

app.get('/v1/playercount/:roomCode', (req, res) => {
  let playerCount = getPlayerCount.all(req.params?.roomCode);
  if (playerCount[0] == undefined) {
    return res.sendStatus(404)
  }
  return res.json({
    count: playerCount[0]['COUNT(*)']
  })
});

app.get('/v1/gameexists/:roomCode', (req, res) => {
  let gameExists = gameCheck.all(req.params?.roomCode);
  if (gameExists[0]?.active != undefined && gameExists[0]?.active != 0) {
    return res.sendStatus(200)
  }
  return res.sendStatus(404)
});

//route that clients automatically send to if time ran out
app.put('/v1/autolateanswer/:roomCode', (req, res) => {
  console.log("autolateanswer received")
  let player = getPlayer.all(req.cookies.playerUuid)
  if (player[0] == undefined) {
    console.log("player not found")
    return res.sendStatus(404)
  }
  if (player[0]?.role === "host") {
    console.log("host tried to send late answer")
    return res.sendStatus(403)
  }
  let question = getQuestionByRoomCodeAndOrder.all(req.params?.roomCode, Math.floor(getGameState.get(req.params?.roomCode)?.state / 2));
  if (question[0] == undefined) {
    console.log("question not found")
    return res.sendStatus(404)
  }
  let hasAlreadyAnswered = hasAnswered.get(req.params?.roomCode, question[0]?.id, player[0]?.uuid)
  if (hasAlreadyAnswered != undefined) {
    console.log("player already answered")
    return res.sendStatus(409)
  }
  console.log("inserting late answer for player " + player[0]?.uuid + " for question " + question[0]?.id)
  insertAnswerForPlayer.run(req.params?.roomCode, question[0]?.id, player[0]?.uuid, null, 2, Date.now())
  return res.sendStatus(200)
});

app.get('/v1/multiplechoiceanswers/:roomCode', (req, res) => {
  let player = getPlayer.all(req.cookies.playerUuid)
  if (player[0]?.role != "host") {
    return res.sendStatus(403)
  }
  let question = getQuestionByRoomCodeAndOrder.all(req.params?.roomCode, Math.floor(getGameState.get(req.params?.roomCode)?.state / 2));
  if (question[0] == undefined) {
    console.log("question not found")
    return res.sendStatus(404)
  }
  let answerOptions = getAnswerOptionsByQuestionId.all(question[0]?.id)
  if (answerOptions[0] == undefined) {
    console.log("answer options not found")
    return res.sendStatus(404)
  }
  let answers = getAnswersForQuestion.all(req.params?.roomCode, question[0]?.id)
  if (answers[0] == undefined) {
    console.log("answers not found")
    return res.sendStatus(404)
  }
  let answerCounts = []
  for (let i = 1; i <= answerOptions?.length; i++) {
    let count = 0;
    for (let j = 0; j < answers?.length; j++) {
      if (answers[j]?.answer == i) {
        count++;
      }
    }
    answerCounts.push({
      answer_order: i,
      answer_text: answerOptions[i - 1]?.answer,
      count: count,
      correct: answerOptions[i - 1]?.is_correct == 1 ? true : false
    })
  }
  return res.json({
    answerCounts: answerCounts
  })
});

app.get('/v1/leaderboard/:roomCode', (req, res) => {
  let players = getPlayersSortedScoreNoConnect.all(req.params?.roomCode)
  if (players[0] == undefined) {
    return res.sendStatus(404)
  }
  let sanitizedPlayers = []
  for (let i = 0; i < players?.length; i++) {
    sanitizedPlayers.push({
      name: players[i]?.name,
      score: players[i]?.score,
      place: i + 1
    })
  }
  return res.json({
    players: sanitizedPlayers
  })
});

app.get('/v1/nomorequestions/:roomCode', (req, res) => {
  let currentQuestionNumber = getGameState.get(req.params?.roomCode)
  let questionCount = getQuestionCountByRoomCode.get(req.params?.roomCode)['COUNT(*)']
  if (currentQuestionNumber == undefined) {
    return res.sendStatus(404)
  }
  return res.json({
    noMoreQuestions: currentQuestionNumber?.state / 2 >= questionCount
  })
});

app.get('/v1/search/:query', (req, res) => {
  let query = req.params?.query
  console.log("search query: " + query)
  if (query == undefined || query == null || query == "") {
    return res.sendStatus(422)
  }
  let words = query.split(" ")
  let searchResults = []
  for (let i = 0; i < words.length; i++) {
    let results = getQuizByWordInTitle.all(`%${words[i]}%`)
    for (let j = 0; j < results.length; j++) {
      //get search term count in title
      let count = 0;
      for (let k = 0; k < words.length; k++) {
        if (results[j]?.title?.toLowerCase().includes(words[k]?.toLowerCase())) {
          count++;
        }
      }
      if (!searchResults.some(e => e.title === results[j].title)) {
        searchResults.push(
          {
            title: results[j]?.title,
            img_link: results[j]?.img_link,
            uuid: results[j]?.public_uuid,
            count: count
          }
        )
      }
    }
  }
  let uniqueResults = []
  for (let i = 0; i < searchResults.length; i++) {
    if (!uniqueResults.some(e => e.title === searchResults[i].title)) {
      uniqueResults.push(searchResults[i])
    }
  }
  let resultsByAppearanceCount = uniqueResults.sort((a, b) => b.count - a.count).slice(0, 50)
  console.log("search results: " + JSON.stringify(resultsByAppearanceCount))
  let wasLeftOverResults = false;
  if (uniqueResults.length > 30) {
    wasLeftOverResults = true;
  }

  //testing
  /*let exampleSearchResults = []
  for (let i = 0; i < 30; i++) {
    exampleSearchResults.push(
      {
        title: "Example Quiz " + (i + 1),
        img_link: "https://placehold.co/600x400",
        uuid: uuidv4(),
        count: 1
      }
    )
  }*/
  return res.json({
    searchResults: resultsByAppearanceCount,
    nextPageAvailable: wasLeftOverResults
  })
});

app.get('/v1/account/:uuid', checkAccountAccess, (req, res) => {
  let user = getuserByUuid.all(req.params?.uuid)
  if (user[0] == undefined) {
    return res.sendStatus(404)
  }
  return res.json({
    name: user[0]?.name,
    uuid: user[0]?.public_uuid
  })
})