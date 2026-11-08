import './Leaderboard.css';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { useEffect, useState } from 'react';
import apiBaseUrl from '../components/apiAdress';
import axios from 'axios';
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";

function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    let roomCodeLoStor = localStorage.getItem("roomCode");

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
    
    }

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
