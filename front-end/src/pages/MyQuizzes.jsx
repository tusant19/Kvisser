import './MyQuizzes.css';
import TopBar from '../components/TopBar.jsx';
import BottomBar from '../components/BottomBar.jsx';
import axios from "axios";
import { useState, useEffect } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

function MyQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [hasTried, setHasTried] = useState(false);
    let uuid = localStorage.getItem("uuid")

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/account/${uuid}/quizzes`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setQuizzes(res.data?.quizzes)
            setHasTried(true);
        })
        .catch((error) => {
            setHasTried(true);
            console.log(error)
        })
    }, [uuid]);

    return(
        <div className="myQuizzesPage">
            <TopBar />
            <div className="myQuizzesPageMain">
                <div className="myQuizzesList">
                    {quizzes.length > 0 ? (
                        quizzes.map((quiz, index) => (
                            <a href={`${siteBaseUrl}/create/quiz/details/${quiz.uuid}`} key={index} className="myQuizzesListItemLink">
                                <div key={index} className="myQuizzesListItem">
                                    <img src={quiz.img_link} alt={quiz.title} className="myQuizzesListItemImage" />
                                    <p className="myQuizzesListItemTitle">{quiz.title}</p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="myQuizzesListEmpty">
                            {hasTried ? (
                                <p className="myQuizzesListEmptyText">No quizzes found. You will see them here after you create some!</p>
                            ) : (
                                <p className="myQuizzesListEmptyText">Loading your quizzes...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default MyQuizzes; 
