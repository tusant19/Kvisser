import './CreateQuizDetails.css'
import TopBar from '../components/TopBar'
import BottomBar from '../components/BottomBar'
import { useState, useEffect, useRef } from 'react'
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
    const privateCheckboxRef = useRef(null);

    useEffect(() => {
        if (quizid) {
            axios.get(`${apiBaseUrl}/v1/quiz/edit/details/${quizid}`)
                .then(response => {
                    const quiz = response.data;
                    setTitle(quiz.title);
                    setImgLink(quiz.img_link);
                    setLanguage(quiz.language);
                    let privateStatus = quiz.private
                    setPrivateQuiz(privateStatus);
                    let checkbox = privateCheckboxRef.current;
                    if (checkbox) {
                        console.log("Set checkbox checked status to: " + privateStatus);
                        checkbox.checked = privateStatus;
                    }
                    setPlayCount(quiz.playCount);
                    const date = new Date(quiz.time_created);
                    setTimeCreated(date.toLocaleDateString());
                    setQuestions(quiz.questions);
                    setHasTried(true);
                    console.log(quiz);
                })
                .catch(error => {
                    console.error("Error fetching quiz details:", error);
                });
        }
    }, [quizid, privateCheckboxRef]);

    function handleLanguageChange(event) {
        setLanguage(event.target.value);
        axios.put(`${apiBaseUrl}/v1/quiz/edit/language/${quizid}`, {
            language: event.target.value
        })
        .then(response => {
            console.log("Language updated successfully");
        })
        .catch(error => {
            console.error("Error updating language:", error);
        });
    }

    function handlePrivateChange(event) {
        let checkbox = privateCheckboxRef.current;
        if (checkbox) {
            console.log("Private checkbox changed to: " + event.target.checked);
            setPrivateQuiz(event.target.checked);
        }
        axios.put(`${apiBaseUrl}/v1/quiz/edit/private/${quizid}`, {
            private: event.target.checked
        })
        .then(response => {
            console.log("Private status updated successfully");
        })
        .catch(error => {
            console.error("Error updating private status:", error);
        });
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
                                <p className="createQuizDetailsPrivate">Private: <input type="checkbox" checked={privateQuiz} ref={privateCheckboxRef} onChange={handlePrivateChange} /></p>
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
                        <div className="createQuizDetailsControls">
                            <a href={`/quiz/edit/${quizid}`} className="createQuizDetailsAddQuestionButton">Add Question</a>
                            <a href={`/quiz/${quizid}`} className="createQuizDetailsPlayButton">Go to Quiz</a>
                        </div>
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
