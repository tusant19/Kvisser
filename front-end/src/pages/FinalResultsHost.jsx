import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import apiBaseUrl from '../components/apiAdress';
import './FinalResultsPlayer.css';
import TopBar from '../components/TopBar';

function FinalResultsHost() {
    const navigate = useNavigate();
    let roomCodeLoStor = localStorage.getItem("roomCode");
    let uuidLoStor = localStorage.getItem("uuid");
    const [hasTried, setHasTried] = useState(false);
    const [players, setPlayers] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');

    useEffect(() => {
        if (hasTried) {
            return;
        }
        axios.get(`${apiBaseUrl}/v1/finalresults/host/${roomCodeLoStor}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log(response.data)
            setPlayers(response.data?.players);
            setQuizTitle(response.data?.title);
            setHasTried(true);
        })
        .catch(error => {
            console.error('Error fetching final results:', error);
            setHasTried(true);
        });
    }, []);

    function handleHomeClick() {
        navigate('/');
    }

    return (
        <div className="finalResultsHostPage">
            <TopBar />
            <div className="finalResultsHostPageMain">
                <p className="finalResultsHostQuizTitle">{quizTitle}</p>

                <div className="finalResultsHostPlayersList">
                    {players.map((player, index) => (
                        <div key={index} className="finalResultHostLeaderboardItem">
                            <div className="finalResultHostLeaderboardItemRankAndName">
                                <p className="finalResultHostLeaderboardItemRank">{player.place}</p>
                                <p className="finalResultHostLeaderboardItemName">{player.name}</p>
                            </div>
                            <p className="finalResultHostLeaderboardItemScore">{player.score}</p>
                        </div>
                    ))}
                </div>
                <div className='finalResultsHomeButtonDiv'>
                    <button onClick={handleHomeClick} className='finalResultsHomeButton'>Home</button>
                </div>
            </div>
        </div>
    );
}

export default FinalResultsHost;