import './CreateQuizDetails.css'
import TopBar from '../components/TopBar'
import BottomBar from '../components/BottomBar'
import { useState, useEffect } from 'react'
import axios from 'axios'
import apiBaseUrl from '../components/apiAdress.js'
import { useParams } from 'react-router'

function CreateQuizDetails() {
    const { quizid } = useParams();
    const [title, setTitle] = useState("");
    const [imgLink, setImgLink] = useState("");
    const [language, setLanguage] = useState("en");
    const [privateQuiz, setPrivateQuiz] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const [timeCreated, setTimeCreated] = useState("");
    const [questions, setQuestions] = useState([]);
    const [hasTried, setHasTried] = useState(false);

    useEffect(() => {
        if (quizid) {
            axios.get(`${apiBaseUrl}/quiz/edit/details/${quizid}`)
                .then(response => {
                    const quiz = response.data;
                    setTitle(quiz.title);
                    setImgLink(quiz.img_link);
                    setLanguage(quiz.language);
                    setPrivateQuiz(quiz.private === 1);
                    setPlayCount(quiz.playCount);
                    const date = new Date(quiz.time_created);
                    setTimeCreated(date.toLocaleDateString());
                    setQuestions(quiz.questions);
                    setHasTried(true);
                })
                .catch(error => {
                    console.error("Error fetching quiz details:", error);
                    setErrorMessage("Error fetching quiz details");
                });
        }
    }, [quizid]);

    function handleLanguageChange(event) {
        //toBeImplemented
    }

    function handlePrivateChange(event) {
        //toBeImplemented
    }

    return (
        <div className="createQuizDetailsPage">
            <TopBar />
            <div className="createQuizDetailsPageMain">
                {hasTried ? (
                    <>
                        <div className="createQuizDetailsContent">
                            <img src={imgLink} alt={title} className="createQuizDetailsImage" />
                            <h1 className="createQuizDetailsTitle">{title}</h1>
                            <div className="createQuizDetailsExtraInfo">
                                <p className="createQuizDetailsLanguage">Language: <input type="text" value={language} onChange={handleLanguageChange} /></p>
                                <p className="createQuizDetailsPrivate">Private: <input type="checkbox" checked={privateQuiz} onChange={handlePrivateChange} /></p>
                                <p className="createQuizDetailsPlayCount">Play Count: {playCount}</p>
                                <p className="createQuizDetailsTimeCreated">Time Created: {timeCreated}</p>
                            </div>
                        </div>

                        {questions.length > 0 && (
                            <div className="createQuizDetailsQuestions">
                                <p className="createQuizDetailsQuestionsTitle">Questions</p>
                                <p className="createQuizDetailsHint">Click on a question to edit it</p>
                                <div className="createQuizDetailsQuestionsList">
                                    {questions.map((question, index) => (
                                        <div key={index} className="createQuizDetailsQuestionItem">
                                            <a href={`/quiz/edit/${quizid}/question/${index}`} className="createQuizDetailsQuestionLink">
                                                <img src={question.img_link} alt={`Question ${index + 1}`} className="createQuizDetailsQuestionImage" />
                                                <div className="createQuizDetailsQuestionInfo">
                                                    <p className="createQuizDetailsQuestionText">{question.question}</p>
                                                    <p className="createQuizDetailsQuestionType">{question.type}</p>
                                                </div>
                                            </a>
                                        </div>
                                    ))}a
                                </div>
                            </div>
                        )}
                        {questions.length === 0 && (
                            <div className="createQuizDetailsNoQuestions Container">
                                <p className="createQuizDetailsNoQuestions">You'll see questions here after you add some.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <p>Loading quiz details...</p>
                )}

            </div>
            <BottomBar />
        </div>
    );
}

export default CreateQuizDetails;
