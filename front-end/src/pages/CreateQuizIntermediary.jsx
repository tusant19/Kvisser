import './CreateQuizIntermediary.css';
import TopBar from '../components/TopBar.jsx';
import BottomBar from '../components/BottomBar.jsx';
import { useState, useRef } from 'react';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

function CreateQuizIntermediary() {
    const quizIdRef = useRef(null);
    const [error, setError] = useState(null);
    const languageRef = useRef(null);
    const privateRef = useRef(null);
    const nameRef = useRef(null);
    const [imgLink, setImgLink] = useState('https://via.placeholder.com/600x400');

    function createQuiz() {
        const name = nameRef.current.value;
        const language = languageRef.current.value;
        const isPrivate = privateRef.current.checked;
        axios.put(`${apiBaseUrl}/v1/create/quiz`, {
            title: name,
            img_link: imgLink,
            language: language,
            private: isPrivate,
            uuid: localStorage.getItem('uuid')
        })
        .then((res) => {
            let quizId = res.data.quizId;
            window.location.replace(`${siteBaseUrl}/create/quiz/details/${quizId}`);
        })
        .catch((error) => {
            console.error(error);
            setError(error?.response?.data?.error || "An error occurred while creating the quiz.");
        });
    }

    return (
        <div className="createQuizIntermediaryPage">
            <TopBar />
            <div className="createQuizIntermediaryPageMain">
                <p>Create Quiz</p>
                <img src={imgLink || 'https://via.placeholder.com/600x400'} alt="Quiz" className="quizCreateImage" />
                <input className="quizCreateIntermediaryInput" type="text" value={imgLink} onChange={(e) => setImgLink(e.target.value)} placeholder="Image Link" />

                <input type="text" className="quizCreateIntermediaryInput" ref={nameRef} placeholder="Quiz Name" />
                <input type="text" className="quizCreateIntermediaryInput" ref={languageRef} placeholder="Language" />
                <div className="privateCheckboxContainer">
                    <input type="checkbox" ref={privateRef} className="privateCheckbox" /> Private
                </div>
                <button className="createQuizIntermediaryButton" onClick={createQuiz}> Create</button>
                {error && <p>{error}</p>}
            </div>
            <BottomBar />
        </div>
    );
}

export default CreateQuizIntermediary;