import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useEffect, useRef, useState } from 'react';
import './Quiz.css'
import { useNavigate, useParams } from 'react-router';
import apiBaseUrl from '../components/apiAdress.js';
import noImg from '../assets/noImg.png'

function Quiz(props) {
    
    const { quizid } = useParams();
    const navigate = useNavigate();
    const [imgLink, setImgLink] = useState("https://placehold.co/600x400");
    const [title, setTitle] = useState(quizid)
    const [questions, setQuestions] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const [madeBy, setMadeBy] = useState("unknown");
    const [timeCreated, setTimeCreated] = useState("unknown");
    const madeByUUID = useRef(null);
    const popupRef = useRef(null);
    
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
                setPlayCount(res.data.playCount)
                setMadeBy(res.data.madeby)
                madeByUUID.current = res.data.madebyuuid
                //get day of creation from timestamp
                let date = new Date(Number(res.data.created))
                setTimeCreated(date.toLocaleDateString())
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

    function host() {
        if (popupRef.current.style.display === "none" || popupRef.current.style.display === "") {
            axios.get(`${apiBaseUrl}/v1/loginstatus`, {
                withCredentials: true
            })
            .then((res) => {
                if (res.status === 200) {
                    navigate(`/host/${quizid}`)
                } else {
                    popupRef.current.style.display = "flex";
                }
            })
            .catch((error) => {
                console.error(error);
                popupRef.current.style.display = "flex";
            });
        } else {
            popupRef.current.style.display = "none";
        }
        

    }

    return (
        <div className='quizPage'>
            <TopBar />
            <div className='quizPageMain'>
                <div className='quizDetailsInfoDiv'>
                        
                            <p>Made by: <a href={`../user/${madeByUUID.current}`} className='madeByLink'>{madeBy}</a></p>
                        
                            <p>Created on: {timeCreated}</p>
                            <p>Played: {playCount} times</p>
                    </div>
                <div className='quizDetailsDiv'>
                    <div className='quizImgDiv'>
                        <img className='quizImg' src={imgLink || noImg} alt="quizImg" />
                    </div>
                    
                    <div className='quizTitleDiv'>
                        <p>{title}</p>
                    </div>
                </div>
                
                
                <div className='questionsDiv'>
                    {questions.map((question, index) => (
                        <div className='questionDiv' key={index}>
                            <div className='questionImgDiv'>
                                <img className='questionImg' src={question.img_link || noImg} alt="questionImg" />
                            </div>
                            
                            <div className='questionTitleDiv'>
                                <p className='questionTitle'>{question.title}</p>
                            </div>
                            
                        </div>
                    ))}
                </div>

                <div className='quizPlayDiv'>
                    <button onClick={host}>Host</button>
                    <button >Play alone</button>
                </div>
                
            </div>
            <div className='popupDiv' ref={popupRef}>
                <p>Hosting without logging in will not save your scores</p>
                <div className='popupOptions'>
                    <a href="../login">
                        <button className='popUpBtn'>Log in</button>
                    </a>
                    <a href={`../host/${quizid}`}> 
                        <button className='popUpBtn'>Continue</button>
                    </a>
                </div>
                <p className='popupClose' onClick={host}>X</p>
            </div>
            <BottomBar />
        </div>
    )
}

export default Quiz
