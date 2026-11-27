import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress';
import '../Main.css'
import './FinalResultsPlayer.css';
import TopBar from '../components/TopBar';

function FinalResultsPlayer() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState(null);
    const [uuid, setUuid] = useState(null);
    const [place, setPlace] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [name, setName] = useState(null);
    const [score, setScore] = useState(null);

    setUuid(localStorage.getItem('uuid'));
    setRoomCode(localStorage.getItem('roomCode'));

    useEffect(() => {
        if (!roomCode || !uuid) {
            return;
        }
        axios.get(`${apiBaseUrl}/v1/finalresults/${roomCode}/${uuid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setPlace(response.data?.playerPlacement);
            setQuizTitle(response.data?.title);
            setName(response.data?.playerName);
            setScore(response.data?.playerScore);
        })
        .catch(error => {
            console.error('Error fetching final results:', error);
        });
    }, [roomCode, uuid]);

    function fancyPlaceName(place) {
        if (place === 1) {
            return `${place}st Place`;
        }
        if (place === 2) {
            return `${place}nd Place`;
        }
        if (place === 3) {
            return `${place}rd Place`;
        }
        return `${place}th Place`;
    }
    
    function handleHomeClick() {
        navigate('/');
    }

    return (
        <div className="finalResultsPlayerPage">
            <TopBar />
            <div className="finalResultsPlayerPageMain">
                <div className="finalResultsTitleDiv">
                    <p className="finalResultsPlayerTitle">Final Results</p>
                </div>
                <div className="finalResultsPlayerContent">
                    <p className="finalResultsPlayerContentText">Quiz Title: {quizTitle}</p>
                    <p className="finalResultsPlayerContentText">{name}</p>
                    <p className="finalResultsPlayerContentText">{score} points</p>
                    <p className="finalResultsPlayerContentText">{fancyPlaceName(place)}</p>
                </div>
                <div className='finalResultsHomeButtonDiv'>
                    <button onClick={handleHomeClick} className='finalResultsHomeButton'>Home</button>
                </div>
            </div>
        </div>
    );
}
