
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import "./Main.css"
import Play from "./pages/Play.jsx";
import Waiting from "./pages/Waiting.jsx";
import Quiz from "./pages/Quiz.jsx";
import Login from "./pages/Login.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Logout from "./pages/Logout.jsx";
import HostWaiting from "./pages/HostWaiting.jsx";
import MuChoQuestion from "./pages/MuChoQuestion.jsx";
import AnswerStatus from "./pages/AnswerStatus.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Search from "./pages/Search.jsx";
import Account from "./pages/Account.jsx";
import MyQuizzes from "./pages/MyQuizzes.jsx";
import User from './pages/User.jsx'
import CreateQuizDetails from './pages/CreateQuizDetails.jsx'
import CreateQuizIntermediary from './pages/CreateQuizIntermediary.jsx'
import QuestionsEditing from './pages/questionsEditing.jsx'
import MyGames from './pages/MyGames.jsx'
import GameResults from './pages/GameResults.jsx'
import ChangeName from './pages/ChangeName.jsx'
import SocketProvider from './components/SocketProvider.jsx'

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <SocketProvider />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="/waiting" element={<Waiting />} />
      <Route path="/quiz/:quizid" element={<Quiz />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<CreateAccount />}/>
      <Route path="/changepassword" element={<ChangePassword />}/>
      <Route path="logout" element={<Logout />}/>
      <Route path="/host/:quizid" element={<HostWaiting/>}/>
      <Route path="multipleChoice" element={<MuChoQuestion/>}/>
      <Route path="/answer/:status" element={<AnswerStatus/>}/>
      <Route path="/leaderboard" element={<Leaderboard/>}/>
      <Route path="/search" element={<Search/>}/>
      <Route path="/account" element={<Account/>}/>
      <Route path="/account/quizzes" element={<MyQuizzes/>}/>
      <Route path="/user/:userid" element={<User/>}/>
      <Route path="/create/quiz" element={<CreateQuizIntermediary/>}/>
      <Route path="/create/quiz/details/:quizid" element={<CreateQuizDetails/>}/>
      <Route path="/quiz/edit/:quizid" element={<QuestionsEditing/>}/>
      <Route path="/quiz/edit/:quizid/question/:questionid" element={<QuestionsEditing/>}/>
      <Route path="/account/games" element={<MyGames/>}/>
      <Route path="/game/:gameid" element={<GameResults/>}/>
      <Route path="/changename" element={<ChangeName/>}/>
    </Routes>
  </BrowserRouter>,
);