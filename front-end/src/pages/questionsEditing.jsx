import { useEffect, useState } from 'react';
import './questionsEditing.css';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress.js';
import { useNavigate, useParams } from 'react-router';
import correctSymbol from '../assets/check_24dp_505050_FILL0_wght400_GRAD0_opsz24.svg';
import noImg from '../assets/noImg.png';

function QuestionsEditing() {
    const { quizid, questionid } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [hasTried, setHasTried] = useState(false);
    const [showQuestionTypes, setShowQuestionTypes] = useState(false);
    const [draft, setDraft] = useState(null);
    const [error, setError] = useState("");
    const questionTypes = [
        {
            id: 'multipleChoice',
            label: 'Multiple choice'
        }
    ];

    useEffect(function () {
        fetchQuestions();
    }, [quizid]);

    useEffect(function () {
        if (questionid === undefined) {
            setDraft(null);
            return;
        }
        let question = questions[Number(questionid)];
        setDraft(null);
        if (question && question.type === 'multipleChoice') {
            let answers = [];
            if (question.answerOptions) {
                for (let i = 0; i < question.answerOptions.length; i++) {
                    answers.push({
                        answer: question.answerOptions[i].answer,
                        is_correct: question.answerOptions[i].is_correct
                    });
                }
            }
            setDraft({
                title: question.title || "",
                img_link: question.img_link || "",
                score_value: question.score_value || 1000,
                time_given: question.time_given || 30,
                answers: answers
            });
        }
    }, [questionid, questions]);

    useEffect(function () {
        window.addEventListener('keydown', closeQuestionTypes);
        return function () {
            window.removeEventListener('keydown', closeQuestionTypes);
        };
    }, []);

    function fetchQuestions() {
        if (!quizid) return;

        axios.get(`${apiBaseUrl}/v1/quiz/edit/details/${quizid}`, { withCredentials: true })
            .then(function (response) {
                setQuestions(response.data.questions || []);
                setHasTried(true);
            })
            .catch(function (error) {
                console.error("Error fetching quiz questions:", error);
                if (error.response && error.response.status === 401) {
                    window.location.replace("/login");
                }
                setHasTried(true);
            });
    }

    function closeQuestionTypes(event) {
        if (event.key === 'Escape') setShowQuestionTypes(false);
    }

    function toggleQuestionTypes() {
        setShowQuestionTypes(!showQuestionTypes);
    }

    function selectQuestionType(questionType) {
        setShowQuestionTypes(false);
        if (questionType.id === 'multipleChoice') createMultipleChoice();
    }

    function saveQuestion() {
        if (!draft) return;
        let question = getSelectedQuestion();
        if (question == null || question.type !== 'multipleChoice') return;
        let incompleteReason = getDraftIncompleteReason();
        if (incompleteReason != "") {
            setError(incompleteReason);
            return;
        }
        let requestData = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: Number(draft.score_value),
            time_given: Number(draft.time_given),
            answers: draft.answers
        };

        let saveRequest;
        if (question.id == null) {
            saveRequest = axios.put(`${apiBaseUrl}/v1/create/question/multiplechoice/${quizid}`, requestData, { withCredentials: true });
        } else {
            saveRequest = axios.put(`${apiBaseUrl}/v1/quiz/edit/question/multiplechoice/${quizid}/${questionid}`, requestData, { withCredentials: true });
        }

        saveRequest.then(function (response) {
            setError("");
            fetchQuestions();
            if (question.id == null && response.data.orderNumber != undefined) {
                navigate(`/quiz/edit/${quizid}/question/${response.data.orderNumber}`);
            }
        })
        .catch(function (error) {
            setError(error.response && error.response.data ? error.response.data.error : "Failed to save question");
        });
    }

    function deleteQuestion(index) {
        let questionIndex = index;
        if (questionIndex == undefined) questionIndex = Number(questionid);
        let question = questions[questionIndex];
        if (question && question.id == null) {
            let remainingQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                if (i != questionIndex) remainingQuestions.push(questions[i]);
            }
            setQuestions(remainingQuestions);
            setDraft(null);
            if (remainingQuestions.length == 0) {
                navigate(`/quiz/edit/${quizid}`);
                return;
            }
            let nextQuestionId = questionIndex;
            if (nextQuestionId >= remainingQuestions.length) nextQuestionId = remainingQuestions.length - 1;
            navigate(`/quiz/edit/${quizid}/question/${nextQuestionId}`);
            return;
        }
        axios.delete(`${apiBaseUrl}/v1/quiz/edit/question/${quizid}/${questionIndex}`, { withCredentials: true })
        .then(function () {
            axios.get(`${apiBaseUrl}/v1/quiz/edit/details/${quizid}`, { withCredentials: true })
            .then(function (response) {
                let remainingQuestions = response.data.questions || [];
                setQuestions(remainingQuestions);
                setDraft(null);

                if (remainingQuestions.length === 0) {
                    navigate(`/quiz/edit/${quizid}`);
                    return;
                }

                let nextQuestionId = questionIndex;
                if (nextQuestionId >= remainingQuestions.length) {
                    nextQuestionId = remainingQuestions.length - 1;
                }
                navigate(`/quiz/edit/${quizid}/question/${nextQuestionId}`);
            })
            .catch(function (error) {
                console.error("Error refreshing questions:", error);
            });
        })
        .catch(function (error) {
            setError(error.response && error.response.data ? error.response.data.error : "Failed to delete question");
        });
    }

    function moveQuestion(direction) {
        if (direction === -1 && Number(questionid) <= 0) return;
        if (direction === 1 && Number(questionid) >= questions.length - 1) return;
        let question = getSelectedQuestion();
        if (question && question.id == null) return;
        axios.put(`${apiBaseUrl}/v1/quiz/edit/question/order/${quizid}/${questionid}`, {
            direction: direction
        }, { withCredentials: true })
        .then(function () {
            navigate(`/quiz/edit/${quizid}/question/${Number(questionid) + direction}`);
        })
        .catch(function (error) {
            setError(error.response && error.response.data ? error.response.data.error : "Failed to move question");
        });
    }

    function createMultipleChoice() {
        let newQuestion = {
            id: null,
            title: "",
            img_link: "",
            type: "multipleChoice",
            score_value: 1000,
            time_given: 30,
            answerOptions: [
                { id: null, answer: "", order_number: 1, is_correct: false },
                { id: null, answer: "", order_number: 2, is_correct: false }
            ]
        };
        let newQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            newQuestions.push(questions[i]);
        }
        newQuestions.push(newQuestion);
        setQuestions(newQuestions);
        setError("");
        navigate(`/quiz/edit/${quizid}/question/${newQuestions.length - 1}`);
    }

    function changeQuestionTitle(event) {
        let newDraft = {
            title: event.target.value,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: draft.answers
        };
        setDraft(newDraft);
    }

    function changeQuestionImage(event) {
        let newDraft = {
            title: draft.title,
            img_link: event.target.value,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: draft.answers
        };
        setDraft(newDraft);
    }

    function changeAnswer(index, event) {
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: []
        };
        for (let i = 0; i < draft.answers.length; i++) {
            let answer = {
                answer: draft.answers[i].answer,
                is_correct: draft.answers[i].is_correct
            };
            if (i === index) answer.answer = event.target.value;
            newDraft.answers.push(answer);
        }
        setDraft(newDraft);
    }

    function setCorrectAnswer(index) {
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: []
        };
        for (let i = 0; i < draft.answers.length; i++) {
            let answer = {
                answer: draft.answers[i].answer,
                is_correct: draft.answers[i].is_correct
            };
            if (i === index) answer.is_correct = !answer.is_correct;
            newDraft.answers.push(answer);
        }
        setDraft(newDraft);
    }

    function addAnswerOption() {
        if (draft.answers.length >= 4) return;
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: []
        };
        for (let i = 0; i < draft.answers.length; i++) {
            newDraft.answers.push({
                answer: draft.answers[i].answer,
                is_correct: draft.answers[i].is_correct
            });
        }
        newDraft.answers.push({
            answer: "",
            is_correct: false
        });
        setDraft(newDraft);
    }

    function deleteAnswerOption(index) {
        if (draft.answers.length <= 2) return;
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: draft.time_given,
            answers: []
        };
        for (let i = 0; i < draft.answers.length; i++) {
            if (i !== index) {
                newDraft.answers.push({
                    answer: draft.answers[i].answer,
                    is_correct: draft.answers[i].is_correct
                });
            }
        }
        setDraft(newDraft);
    }

    function changeQuestionTime(event) {
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: draft.score_value,
            time_given: event.target.value,
            answers: draft.answers
        };
        setDraft(newDraft);
    }

    function changeQuestionScore(event) {
        let newDraft = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: event.target.value,
            time_given: draft.time_given,
            answers: draft.answers
        };
        setDraft(newDraft);
    }

    function getSelectedQuestion() {
        if (questionid === undefined) return null;
        return questions[Number(questionid)] || null;
    }

    function isIncompleteQuestion(question) {
        if (question == null) return true;
        if (question.title == "") return true;
        if (!question.answerOptions || question.answerOptions.length < 2) return true;

        let hasCorrectAnswer = false;
        for (let i = 0; i < question.answerOptions.length; i++) {
            if (question.answerOptions[i].answer == "") return true;
            if (question.answerOptions[i].is_correct) hasCorrectAnswer = true;
        }
        return !hasCorrectAnswer;
    }

    function getIncompleteReason(question) {
        if (question == null) return "Question is incomplete";
        if (question.title == "") return "Question title is missing";
        if (!question.answerOptions || question.answerOptions.length < 2) return "At least two answers are required";

        let hasCorrectAnswer = false;
        for (let i = 0; i < question.answerOptions.length; i++) {
            if (question.answerOptions[i].answer == "") return "An answer is missing text";
            if (question.answerOptions[i].is_correct) hasCorrectAnswer = true;
        }
        if (!hasCorrectAnswer) return "No correct answer selected";
        return "";
    }

    function getDraftIncompleteReason() {
        if (!draft) return "Question is incomplete";
        if (draft.title == "") return "Question title is missing";
        if (draft.answers.length < 2) return "At least two answers are required";

        let hasCorrectAnswer = false;
        for (let i = 0; i < draft.answers.length; i++) {
            if (draft.answers[i].answer == "") return "An answer is missing text";
            if (draft.answers[i].is_correct) hasCorrectAnswer = true;
        }
        if (!hasCorrectAnswer) return "No correct answer selected";
        if (Number(draft.time_given) <= 0) return "Time must be greater than zero";
        if (Number(draft.score_value) < 0) return "Score cannot be negative";
        return "";
    }

    function autoSaveDraft() {
        if (!draft) return;
        let question = getSelectedQuestion();
        if (question == null || question.type !== 'multipleChoice') return;
        if (getDraftIncompleteReason() != "") return;

        let requestData = {
            title: draft.title,
            img_link: draft.img_link,
            score_value: Number(draft.score_value),
            time_given: Number(draft.time_given),
            answers: draft.answers
        };

        let saveRequest;
        if (question.id == null) {
            saveRequest = axios.put(`${apiBaseUrl}/v1/create/question/multiplechoice/${quizid}`, requestData, { withCredentials: true });
        } else {
            saveRequest = axios.put(`${apiBaseUrl}/v1/quiz/edit/question/multiplechoice/${quizid}/${questionid}`, requestData, { withCredentials: true });
        }

        saveRequest
        .then((res) => {
            console.log("Draft auto-saved successfully");
            if (question.id == null) fetchQuestions();
        })
        .catch((error) => {
            console.error("Error auto-saving draft:", error);
        });
    }

    function handleSwitch(quizId, index) {
        autoSaveDraft();
        navigate(`/quiz/edit/${quizId}/question/${index}`);
    }


    function renderQuestionEditor(question) {
        if (question == null) return <p>Question not found</p>;
        if (draft == null) return <p>Loading question...</p>;

        if (question.type === 'multipleChoice') {
            return (
                <div className="multipleChoiceEditor">
                    <input type="text" value={draft.img_link} onChange={changeQuestionImage} className="questionEditorImageLink" placeholder="Image link" />
                    <div className="questionEditorImageDiv">
                        {draft.img_link && <img src={draft.img_link} alt="" className="questionEditorImage" />}
                    </div>
                    <input type="text" value={draft.title} onChange={changeQuestionTitle} className="questionEditorTitle" placeholder="Question" />

                    {draft.answers.map(function (answer, index) {
                        return (
                            <div key={index} className={'questionEditorAnswer answer' + (index + 1)}>
                                <button type="button" onClick={function () { setCorrectAnswer(index); }} className={'questionEditorCorrectAnswer' + (answer.is_correct ? ' selected' : '')}>
                                    {answer.is_correct && <img src={correctSymbol} alt="" />}
                                </button>
                                <input type="text" value={answer.answer} placeholder="Answer" onChange={function (event) { changeAnswer(index, event); }} className="questionEditorAnswerInput" />
                                {draft.answers.length > 2 && <button type="button" onClick={function () { deleteAnswerOption(index); }} className="questionEditorDeleteAnswer">X</button>}
                            </div>
                        );
                    })}

                    {draft.answers.length < 4 && <button type="button" onClick={addAnswerOption} className={'questionEditorAddAnswer answerSlot' + (draft.answers.length + 1)}>Add answer</button>}

                    <div className="questionEditorSettings">
                        <label>Seconds to answer <input type="number" min="1" value={draft.time_given} onChange={changeQuestionTime} className="questionEditorNumber" /></label>
                        <label>Maximum score <input type="number" min="0" value={draft.score_value} onChange={changeQuestionScore} className="questionEditorNumber" /></label>
                    </div>

                    {error && <p className="questionEditorError">{error}</p>}

                    <div className="questionEditorControls">
                        <button type="button" onClick={function () { moveQuestion(-1); }} className="questionEditorButton">Up</button>
                        <button type="button" onClick={function () { moveQuestion(1); }} className="questionEditorButton">Down</button>
                        <button type="button" onClick={deleteQuestion} className="questionEditorButton">Delete</button>
                        <button type="button" onClick={saveQuestion} className="questionEditorButton">Save</button>
                    </div>
                </div>
            );
        }

        return <p>This question type does not have an editor yet</p>;
    }

    return (
        <div className="questionsEditingPage">
            <TopBar />
            <div className="questionsEditingLayout">
                <aside className="questionsSidebar" aria-label="Quiz questions">
                    <button type="button" className="questionsSidebarBackToQuizEdit" onClick={function () { navigate(`/create/quiz/details/${quizid}`); }}>Back to quiz</button>
                    <div className="questionsSidebarList">
                        
                        {questions.map(function (question, index) {
                            return (
                                <div className="questionSidebarItemContainer" key={index}>
                                    <div className="questionSidebarItemControls">
                                        <button type="button" className='questionDeleteBtn' title="Delete" onClick={function () { deleteQuestion(index); }}>X</button>
                                        {isIncompleteQuestion(question) && (
                                            <div className="warnOfIncompleteQuestion" title={getIncompleteReason(question) + ". This question will not be saved unless you complete it."}>
                                                <p className="warnOfIncompleteQuestionText">!</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        key={question.id || index}
                                        type="button"
                                        onClick={function () { handleSwitch(quizid, index); }}
                                        className={`questionSidebarItem ${String(questionid) === String(index) ? 'active' : ''}`}
                                    >   
                                        <span className="questionSidebarNumber">{index + 1}</span>
                                        <div className="questionSidebarPreview">
                                            <p className="questionSidebarTitle">{question.title || 'No title given yet'}</p>
                                            
                                                <img src={question.img_link || noImg} alt="" className="questionSidebarImage" />
                                            
                                        </div>
                                    </button>
                                </div>
                                
                            )
                        })}

                        {hasTried && questions.length === 0 && (
                            <p className="questionsSidebarEmpty">No questions yet</p>
                        )}
                    </div>

                    <div className="questionsSidebarAddContainer">
                        {showQuestionTypes && (
                            <div className="questionTypesPopup" role="menu" aria-label="Choose a question type">
                                {questionTypes.map(function (questionType) {
                                    return <button key={questionType.id} type="button" role="menuitem" className="questionTypeOption" onClick={function () { selectQuestionType(questionType); }}>{questionType.label}</button>;
                                })}
                            </div>
                        )}

                        <button type="button" className="questionsSidebarAdd" aria-haspopup="menu" aria-expanded={showQuestionTypes} onClick={toggleQuestionTypes}>Add</button>
                    </div>
                    {error && <p className="questionEditorError">{error}</p>}
                </aside>

                <main className="questionEditingMain">
                    {questionid === undefined ? (
                        <p>Select or add a question</p>
                    ) : (
                        renderQuestionEditor(getSelectedQuestion())
                    )}
                </main>
            </div>
            <BottomBar />
        </div>
    );
}

export default QuestionsEditing;