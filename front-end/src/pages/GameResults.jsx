import axios from "axios";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import apiBaseUrl from '../components/apiAdress.js';
import './GameResults.css';
import siteBaseUrl from '../components/baseAdress.js';

function GameResults() {
    let { gameid } = useParams();
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [quizUuid, setQuizUuid] = useState("");
    const [hasTried, setHasTried] = useState(false);
    const [error, setError] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/gamedetails/${gameid}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            console.log("Game details response:", res.data);
            setTitle(res.data?.title);
            setStartTime(res.data?.timePlayed);
            setRoomCode(res.data?.roomCode);
            setQuizUuid(res.data?.quizUuid);
            setLeaderboard(res.data?.leaderboard);
            setQuestions(res.data?.questions);
            setAnswers(res.data?.answers);
            setHasTried(true);
        })
        .catch((error) => {
            setHasTried(true);
            setError(error);
        });
    }, [gameid]);

    function handleCollapseClick(event) {
        const button = event.currentTarget;
        const content = button.nextElementSibling;
        if (content.style.display === "none") {
            content.style.display = "flex";
        } else {
            content.style.display = "none";
        }
    }

    return (
        <div className="gameResultsPage">
            <TopBar />
            <div className="gameResultsPageMain">
                {hasTried ? (
                    error ? (
                        <p className="gameResultsError">Error loading game results: {error.message}</p>
                    ) : (
                        <div className="gameResultsContent">
                            <div className="gameResultsInfo">
                                <p className="gameResultsTitle">{title}</p>
                                <p className="gameResultsRoomCode">Room Code: {roomCode}</p>
                                <p className="gameResultsQuizUuid">Quiz UUID: {quizUuid}</p>
                                <p className="gameResultsStartTime">Start Time: {new Date(startTime).toLocaleString()}</p>
                            </div>
                            <div className="gameResultsLeaderboard">
                                <p className="gameResultsLeaderboardTitle">Leaderboard</p>
                                {leaderboard.length > 0 ? (
                                    <div className="gameResultsLeaderboardList">
                                        {leaderboard.map((player, index) => (
                                            <div key={index} className="gameResultsLeaderboardItem">
                                                <p className="gameResultsLeaderboardItemName">{player.name}</p>
                                                <p className="gameResultsLeaderboardItemScore">{player.score}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="gameResultsLeaderboardEmpty">No players played this game.</p>
                                )}
                            </div>
                            <div className="gameResultsQuestions">
                                
                                {questions.length > 0 ? (
                                    <div className="gameResultsQuestionsList">
                                        {questions.length > 0 ? (
                                            questions.map((question, index) => (
                                                <div key={index} className="gameResultsQuestionItem">
                                                    <button className="gameResultsQuestionCollapseOpenBtn" onClick={handleCollapseClick}> {question.title} </button>
                                                    <div className="gameResultsQuestionCollapseContent">
                                                        {answers?.length > 0 ? (
                                                            <div className="gameResultsQuestionAnswersList">
                                                                {answers.filter(answer => answer.questionOrder === question.order_number).map((answer, answerIndex) => (
                                                                    <div key={answerIndex} className="gameResultsQuestionAnswerItem">
                                                                        <p className="gameResultsQuestionAnswerPlayer">{answer.inner_answers[0]?.playerName}</p>
                                                                        <p className="gameResultsQuestionAnswerText">{answer.inner_answers[0]?.answer}</p>
                                                                        {!answer.inner_answers[0]?.wasLate && answer.inner_answers[0]?.isCorrect && <p className="gameResultsQuestionAnswerStatus correct">Correct</p>}
                                                                        {!answer.inner_answers[0]?.wasLate && !answer.inner_answers[0]?.isCorrect && answer.inner_answers[0] != null && <p className="gameResultsQuestionAnswerStatus incorrect">Incorrect</p>}
                                                                        {answer.inner_answers[0]?.wasLate && <p className="gameResultsQuestionAnswerStatus late">Late</p>}
                                                                        {answer.inner_answers[0] == null && <p className="gameResultsQuestionAnswerStatus noAnswer">No Answers</p>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="gameResultsQuestionAnswersEmpty">No answers found for this question.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="gameResultsQuestionsEmpty">No questions found for this game.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="gameResultsQuestionsEmpty">No questions found for this game.</p>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <p className="gameResultsLoading">Loading game results...</p>
                )}
            </div>
            <BottomBar />
        </div>
    );
}

export default GameResults;