import { useEffect, useState } from 'react';
import './questionsEditing.css';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress.js';
import { useParams } from 'react-router';

function QuestionsEditing() {
    const { quizid, questionid } = useParams();
    const [questions, setQuestions] = useState([]);
    const [hasTried, setHasTried] = useState(false);
    const [showQuestionTypes, setShowQuestionTypes] = useState(false);
    const questionTypes = [
        {
            id: 'multipleChoice',
            label: 'Multiple choice'
        }
    ];

    useEffect(() => {
        fetchQuestions();
    }, [quizid]);

    useEffect(() => {
        window.addEventListener('keydown', closeQuestionTypes);
        return () => window.removeEventListener('keydown', closeQuestionTypes);
    }, []);

    function fetchQuestions() {
        if (!quizid) return;

        axios.get(`${apiBaseUrl}/v1/quiz/edit/details/${quizid}`)
            .then(response => {
                setQuestions(response.data.questions || []);
                setHasTried(true);
            })
            .catch(error => {
                console.error("Error fetching quiz questions:", error);
                setHasTried(true);
            });
    }

    function closeQuestionTypes(event) {
        if (event.key === 'Escape') setShowQuestionTypes(false);
    }

    function toggleQuestionTypes() {
        setShowQuestionTypes(current => !current);
    }

    function selectQuestionType(questionType) {
        // TODO: Create a question of this type.
    }

    function openQuestion(question) {
        // TODO: Open the selected question in the editor.
    }

    function saveQuestion() {
        // TODO: Save the current question.
    }

    function deleteQuestion() {
        // TODO: Delete the current question.
    }

    function moveQuestion(direction) {
        // TODO: Move the current question up or down.
    }

    function changeQuestionTitle(event) {
        // TODO: Update the question title.
    }

    function changeQuestionImage(event) {
        // TODO: Update the question image.
    }

    function changeAnswer(index, event) {
        // TODO: Update an answer option.
    }

    function setCorrectAnswer(index) {
        // TODO: Set the correct answer option.
    }

    function addAnswerOption() {
        // TODO: Add an answer option.
    }

    function deleteAnswerOption(index) {
        // TODO: Delete an answer option.
    }

    function changeQuestionTime(event) {
        // TODO: Update the time given for the question.
    }

    function changeQuestionScore(event) {
        // TODO: Update the question score.
    }

    return (
        <div className="questionsEditingPage">
            <TopBar />
            <div className="questionsEditingLayout">
                <aside className="questionsSidebar" aria-label="Quiz questions">
                    <div className="questionsSidebarList">
                        {questions.map((question, index) => (
                            <a
                                key={question.id || index}
                                href={`/quiz/edit/${quizid}/question/${index}`}
                                className={`questionSidebarItem ${String(questionid) === String(index) ? 'active' : ''}`}
                            >
                                <span className="questionSidebarNumber">{index + 1}</span>
                                <div className="questionSidebarPreview">
                                    <p className="questionSidebarTitle">{question.question || `Question ${index + 1}`}</p>
                                    {question.img_link ? (
                                        <img src={question.img_link} alt="" className="questionSidebarImage" />
                                    ) : (
                                        <div className="questionSidebarImagePlaceholder" aria-hidden="true" />
                                    )}
                                    <span className="questionSidebarType">{question.type || 'Multiple choice'}</span>
                                </div>
                            </a>
                        ))}

                        {hasTried && questions.length === 0 && (
                            <p className="questionsSidebarEmpty">No questions yet</p>
                        )}
                    </div>

                    <div className="questionsSidebarAddContainer">
                        {showQuestionTypes && (
                            <div className="questionTypesPopup" role="menu" aria-label="Choose a question type">
                                {questionTypes.map(questionType => (
                                    <button key={questionType.id} type="button" role="menuitem" className="questionTypeOption" onClick={() => selectQuestionType(questionType)}>{questionType.label}</button>
                                ))}
                            </div>
                        )}

                        <button type="button" className="questionsSidebarAdd" aria-haspopup="menu" aria-expanded={showQuestionTypes} onClick={toggleQuestionTypes}>Add</button>
                    </div>
                </aside>

                <main className="questionEditingMain">
                    {questionid === undefined ? (
                        <p>Select or add a question</p>
                    ) : (
                        <p>Editing question {Number(questionid) + 1}</p>
                    )}
                </main>
            </div>
            <BottomBar />
        </div>
    );
}

export default QuestionsEditing;