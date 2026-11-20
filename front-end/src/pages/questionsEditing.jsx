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
    }, [quizid]);

    useEffect(() => {
        function closeQuestionTypes(event) {
            if (event.key === 'Escape') {
                setShowQuestionTypes(false);
            }
        }

        window.addEventListener('keydown', closeQuestionTypes);
        return () => window.removeEventListener('keydown', closeQuestionTypes);
    }, []);

    function selectQuestionType(questionType) {
        setShowQuestionTypes(false);
        // Question creation will be implemented here once the add-question endpoint is ready.
        console.log(`Selected question type: ${questionType.id}`);
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
                                    <button
                                        key={questionType.id}
                                        type="button"
                                        role="menuitem"
                                        className="questionTypeOption"
                                        onClick={() => selectQuestionType(questionType)}
                                    >
                                        {questionType.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            className="questionsSidebarAdd"
                            aria-haspopup="menu"
                            aria-expanded={showQuestionTypes}
                            onClick={() => setShowQuestionTypes(current => !current)}
                        >
                            Add
                        </button>
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