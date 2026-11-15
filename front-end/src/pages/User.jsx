import './User.css'
import TopBar from '../components/TopBar.jsx';
import BottomBar from '../components/BottomBar.jsx';
import { useState, useRef, useEffect } from 'react';
import axios from "axios";
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';
import { useParams } from 'react-router';
import Carousel from '../components/Carousel.jsx'

function User() {
    let { userid } = useParams();
    const [name, setName] = useState("");
    const [totalQuizzes, setTotalQuizzes] = useState(0);
    const [totalPlays, setTotalPlays] = useState(0);
    const [quizzes, setQuizzes] = useState([]);
    const [hasTried, setHasTried] = useState(false);
    const uuidRef = useRef(userid);
    

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/profile/${uuidRef.current}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            console.log(res.data)
            setName(res.data.name);
            setTotalQuizzes(res.data.quizcount)
            setTotalPlays(res.data.playcount)
            
            setHasTried(true);
        })
        .catch((error) => {
            console.error(error);
            setHasTried(true);
        });
    }, [uuidRef.current]);

    return (
        <div className="userPage">
            <TopBar />
            <div className="userPageMain">

                {name && hasTried && (
                    <div className="userInfo">
                        <h2 className="userName">{name}</h2>
                        <p className="userStats">Total Quizzes: {totalQuizzes}</p>
                        <p className="userStats">Total Plays: {totalPlays}</p>
                    </div>
                )}
                <div className="userQuizzes">
                    {quizzes.length > 0 ? (
                        <Carousel path={'/blablaunnesecary'} title={"The user's quizzes"} manualData={quizzes} />
                    ) : (
                        <div className="userQuizzesEmpty">
                            {hasTried ? (
                                <p className="userQuizzesEmptyText">No quizzes found.</p>
                            ) : (
                                <p className="userQuizzesEmptyText">Loading profile...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default User;