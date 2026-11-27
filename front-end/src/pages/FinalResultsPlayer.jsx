import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress';
import '../Main.css'
import './FinalResultsPlayer.css';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';

function FinalResultsPlayer() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState(null);
    const [uuid, setUuid] = useState(null);
    const placeRef = useRef(null);
    const [place, setPlace] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [name, setName] = useState(null);
    const [score, setScore] = useState(null);
    const [hasTried, setHasTried] = useState(false);

    let roomCodeLoStor = localStorage.getItem("roomCode");
    let uuidLoStor = localStorage.getItem("uuid");

    useEffect(() => {
        setRoomCode(roomCodeLoStor)
        setUuid(uuidLoStor)
        if (!roomCodeLoStor || !uuidLoStor) {
            return;
        }
        if (hasTried) {
            return;
        }
        axios.get(`${apiBaseUrl}/v1/finalresults/player/${roomCodeLoStor}/${uuidLoStor}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log(response.data)
            placeRef.current = response.data?.playerPlacement;
            setQuizTitle(response.data?.title);
            setName(response.data?.playerName);
            setScore(response.data?.playerScore);
            setHasTried(true);
        })
        .catch(error => {
            console.error('Error fetching final results:', error);
            setHasTried(true);
        });
    }, []);

    useEffect(() => {
        let placeName = '';
            if (placeRef.current === 1) {
                placeName = `${placeRef.current}st Place`;
            } else if (placeRef.current === 2) {
                placeName = `${placeRef.current}nd Place`;
            } else if (placeRef.current === 3) {
                placeName = `${placeRef.current}rd Place`;
            } else {
                placeName = `${placeRef.current}th Place`;
            }
            setPlace(placeName);
    }, [placeRef.current]);
        
    
    function handleHomeClick() {
        navigate('/');
    }

    return (
        <div className="finalResultsPlayerPage">
            <TopBar />
            <div className="finalResultsPlayerPageMain">
                {!hasTried && <p>Loading results...</p>}
                {hasTried && placeRef.current != null && (
                    <>
                        <p className="finalResultsPlayerTitle">{quizTitle}</p>
                    
                    <div className='finalResultsPlayerPlaceDiv'>
                        <p className="finalResultsPlayerPlace">{place}</p>
                    </div>
                    <div className="finalResultsPlayerContent">
                        <p className="finalResultsPlayerName">{name}</p>
                        <p className="finalResultsPlayerScore">{score} points</p>
                    </div>
                    <div className='finalResultsHomeButtonDiv'>
                        <button onClick={handleHomeClick} className='finalResultsHomeButton'>Home</button>
                    </div>
                </>
                )}
                {hasTried && placeRef.current == null && (
                    <p>Results not found.</p>
                )}
            </div>
            <BottomBar/>
        </div>
        
    );
}


export default FinalResultsPlayer