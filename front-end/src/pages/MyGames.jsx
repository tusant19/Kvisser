import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';
import './MyGames.css';

function MyGames() {
    const [hasTried, setHasTried] = useState(false);
    const [games, setGames] = useState([]);
    let uuid = localStorage.getItem("uuid");

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/account/${uuid}/games`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            console.log(res.data?.games);
            setGames(res.data?.games);
            setHasTried(true);
        })
        .catch((error) => {
            setHasTried(true);
            console.log(error);
        });
    }, [uuid]);

    return (
        <div className="myGamesPage">
            <TopBar />
            <div className="myGamesPageMain">
                {hasTried ? (
                    <div className="myGamesList">
                        {games?.length > 0 ? (
                            games?.map((game, index) => (
                                    <div key={index} className="myGamesListItem">
                                        <p className="myGamesListItemDate">{new Date(game.timePlayed).toLocaleString()}</p>
                                        <a className="myGamesListItemTitle myGamesListLinkBtn" href={`${siteBaseUrl}/quiz/${game.quizUuid}`}>{game.title}</a>
                                        <a className="myGamesListItemLink myGamesListLinkBtn" href={`${siteBaseUrl}/game/${game.publicUuid}`}>See results</a>
                                    </div>
                            ))
                        ) : (
                            <p className="myGamesListEmpty">No games found.</p>
                        )}
                    </div>
                ) : (
                    <p className="myGamesListLoading">Loading...</p>
                )}
            </div>
            <BottomBar />
        </div>
    );
}

export default MyGames;