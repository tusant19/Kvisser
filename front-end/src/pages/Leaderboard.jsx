import './Leaderboard.css';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { useEffect, useState } from 'react';
import apiBaseUrl from '../components/apiAdress';
import axios from 'axios';
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import { useNavigate } from 'react-router';

function Leaderboard() {
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);
    let roomCodeLoStor = localStorage.getItem("roomCode");
    let uuid = localStorage.getItem("uuid");

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/leaderboard/${roomCodeLoStor}`, {
            withCredentials: true,
        })
        .then((response) => {
            console.log(response.data);
            setLeaderboardData(response.data.players);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    function handleLeaderboardContClick() {
        const socket = io(apiBaseUrl)
        socket.on("nextQuestionSwap", (type) => {
            console.log("NQS")
            socket.disconnect();
            navigate(`/${type}`);
        });
        socket.emit("nextQuestionFromLeaderboard", roomCodeLoStor, uuid)
        

        return () => {
            socket.off("nextQuestionSwap")
            socket.disconnect();
        }
    }

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/nomorequestions/${roomCodeLoStor}`, {
            withCredentials: true,
        })
        .then((response) => {
            console.log(response.data);
            if (response.data.noMoreQuestions) {
                let title = document.querySelector(".leaderboardTitle");
                let button = document.querySelector(".leaderboardContBtn");
                title.textContent = "Thanks for playing!";
                button.textContent = "Return to Home";
                button.addEventListener("click", () => {
                    navigate('/');
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    return (
        <div className="leaderboardPage">
            <TopBar />
            <div className="leaderboardPageMain">
                <div className="leaderboardContBtnDiv" >
                    <button className="leaderboardContBtn" onClick={handleLeaderboardContClick}>Continue</button>
                </div>
                <p className="leaderboardTitle">Leaderboard</p>
                <div className="leaderboardList">
                    {leaderboardData.slice(0, 5).map((player, index) => (
                        <div key={index} className="leaderboardItem">
                            <div className="leaderboardItemRankAndName">
                                <p className="leaderboardItemRank">{index + 1}</p>
                                <p className="leaderboardItemName">{player.name}</p>
                            </div>
                            <p className="leaderboardItemScore">{player.score}</p>
                        </div>
                    ))}
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default Leaderboard;
