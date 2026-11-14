
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

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
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
    </Routes>
  </BrowserRouter>,
);