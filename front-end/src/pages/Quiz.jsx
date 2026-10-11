import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useEffect, useRef, useState } from 'react';
import './Quiz.css'
import { useParams } from 'react-router';
import apiBaseUrl from '../components/apiAdress.js';

function Quiz(props) {
    const { quizid } = useParams();
    const [imgLink, setImgLink] = useState("https://placehold.co/600x400");
    const [title, setTitle] = useState(quizid)
    const [questions, setQuestions] = useState([]);
    const [notFound, setNotFound] = useState(false);
    
    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/quiz/${quizid}`, {},
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                setTitle(res.data.title)
                setImgLink(res.data.img_link)
                setQuestions(res.data.questions)
                console.log(res)
                setNotFound(false);
            })
            .catch((error) => {
                if (error.status == 404) {
                    setNotFound(true);
                }
                console.error(error);
            });
    }, [])

    if (notFound) {
        return (
        <div className='quizPage'>
            <TopBar />
            <div className='quizPageMain'>
                <div>
                    <p>Quiz not found</p>
                </div>
            </div>
            <BottomBar />
        </div>
        )
    }

    return (
        <div className='quizPage'>
            <TopBar />
            <div className='quizPageMain'>
                <div className='quizDetailsDiv'>
                    <div className='quizImgDiv'>
                        <img className='quizImg' src={imgLink} alt="quizImg" />
                    </div>
                    <div className='quizTitleDiv'>
                        <p>{title}</p>
                    </div>
                </div>
                
                
                <div className='questionsDiv'>
                    {questions.map((question, index) => (
                        <div className='questionDiv' key={index}>
                            <div className='questionImgDiv'>
                                <img className='questionImg' src={question.question} alt="questionImg" />
                            </div>
                            
                            <div className='questionTitleDiv'>
                                <p className='questionTitle'>{question.title}</p>
                            </div>
                            
                        </div>
                    ))}
                </div>

                <div className='quizPlayDiv'>
                    <button >Host</button>
                    <button >Play alone</button>
                </div>
                
            </div>
            <BottomBar />
        </div>
    )
}

export default Quiz
