import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import apiBaseUrl from '../components/apiAdress';
import './FinalResultsHost.css';
import TopBar from '../components/TopBar';

function FinalResultsHost() {
    const navigate = useNavigate();
    let roomCodeLoStor = localStorage.getItem("roomCode");
    let uuidLoStor = localStorage.getItem("uuid");
    const [hasTried, setHasTried] = useState(false);
    const [players, setPlayers] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [gameUUID, setGameUUID] = useState(null);

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
            setGameUUID(response.data?.gameUUID);
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
    
    function handleDetailedResultsClick() {
        navigate(`/game/${gameUUID}`);
    }

    return (
        <div className="finalResultsHostPage">
            <TopBar />
            <div className="finalResultsHostPageMain">
                <p className="finalResultsHostQuizTitle">{quizTitle}</p>

                <div className="finalResultsHostPlayersList">
                    {players.map((player, index) => (
                        <div key={index} className="finalResultsHostLeaderboardItem">
                            <div className="finalResultsHostLeaderboardItemRankAndName">
                                <p className="finalResultsHostLeaderboardItemRank">{player.place}</p>
                                <p className="finalResultsHostLeaderboardItemName">{player.name}</p>
                            </div>
                            <p className="finalResultsHostLeaderboardItemScore">{player.score}</p>
                        </div>
                    ))}
                </div>
                <div className='finalResultsHostButtonsDiv'>
                    <button onClick={handleDetailedResultsClick} className='finalResultsHostDetailedResultsButton'>Detailed Results</button>
                    <button onClick={handleHomeClick} className='finalResultsHostHomeButton'>Home</button>
                </div>
            </div>
        </div>
    );
}

export default FinalResultsHost;