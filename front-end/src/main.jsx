
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

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="/waiting" element={<Waiting />} />
      <Route path="/quiz/:quizid" element={<Quiz />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/createaccount" element={<CreateAccount />}/>
      <Route path="/changepassword" element={<ChangePassword />}/>
      <Route path="logout" element={<Logout />}/>
    </Routes>
  </BrowserRouter>,
);