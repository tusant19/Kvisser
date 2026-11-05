import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import './MuChoQuestion.css';
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import { useState } from 'react';
import { useRef } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress';
import siteBaseUrl from '../components/baseAdress';
import { useEffect } from 'react';
import '../Main.css'


function MuChoQuestion() {
    const [playerDetails, setPlayerDetails] = useState(null)
    const [isHost, setIsHost] = useState(false)
    const [question, setQuestion] = useState(null)
    const [answerOptions, setAnswerOptions] = useState([])
    let roomCodeLoStor = localStorage.getItem("roomCode") 
    
    let answerOptionRefs = useRef([]);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/question/${roomCodeLoStor}`, {
            withCredentials: true
        })
        .then((response) => {
            console.log(response.data.question);
            setQuestion(response.data.question);
            console.log(response.data.answerOptions);
            setAnswerOptions(response.data.answerOptions);
            setupTimerBar(response.data.question.time_given);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playerDetails`, {
            withCredentials: true
        })
        .then((response) => {
            setPlayerDetails(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])
        
    useEffect(() => {
        axios.get('${apiBaseUrl}/v1/role', {
            withCredentials: true
        })
        .then((response) => {
            setIsHost(response.data.role === "host");
            hideForNonHosts();
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        const socket = io(apiBaseUrl)
        if (isHost) {
            socket.emit("joinRoomAsHost", roomCodeLoStor)
        } else {
            socket.emit("joinRoom", roomCodeLoStor)
        } 
    }, [isHost, roomCodeLoStor])

    useEffect(() => {
        const socket = io(apiBaseUrl)
        socket.on("leaderBoardRedirect", () => {
            window.location.replace(`${siteBaseUrl}/leaderboard`);
        });
    }, []);

    function handleAnswerOptions() {   
        console.log(answerOptionRefs?.current[1]?.style)
        console.log(answerOptions?.length)
        if (answerOptionRefs?.current[1]?.style) {
            
            if (answerOptions?.length == 2) {
                for (let i = 0; i < answerOptions?.length - 1; i++) {
                    // set the row and column
                    answerOptionRefs.current[i + 1].style.gridRow = "3, 4";
                    answerOptionRefs.current[i + 1].style.gridColumn = `${i + 1}, ${i + 1}`;
                }
            } else if (answerOptions?.length == 3) {
                for (let i = 0; i < answerOptions?.length - 1; i++) {
                    // set the row and column
                    let column = i % 2
                    if (i == 2) {
                        answerOptionRefs.current[i + 1].style.gridRow = "4";
                    } else {
                        answerOptionRefs.current[i + 1].style.gridRow = "3";
                    }
                    answerOptionRefs.current[i + 1].style.gridColumn = `${column + 1}, ${column + 1}`;
                }
            } else if (answerOptions?.length > 3) {
                for (let i = 0; i < answerOptions?.length; i++) {
                    // set the row and column
                    let modulo = i % 2
                    let column;
                    if (modulo == 0) {
                        column = 2
                    } else {
                        column = 4
                    }
                    let row;
                    if (i > 1) {
                        row = 9
                    }
                    else {
                        row = 7
                    }
                    console.log("row: " + row)
                    console.log("column: " + column)
                    console.log("style: ", answerOptionRefs.current[i + 1].style)
                    answerOptionRefs.current[i + 1].style.gridRow = `${row} / ${row}`;
                    answerOptionRefs.current[i + 1].style.gridColumn = `${column} / ${column}`;
                }
            }
        }
    }
    
    function hideForNonHosts() {
        if (!isHost) {
            const leaderBoardBtn = document.querySelector('.leaderBoardBtn');
            leaderBoardBtn.style.display = 'none';
        }
    }

    function setupTimerBar(seconds) {
        const timeLeftBar = document.querySelector('.timeLeftBar');
        let timeLeft = seconds;
        const timer = setInterval(() => {
            timeLeft -= 1;
            let percentage = (timeLeft / seconds) * 100;
            let wholeNumberPercentage = Math.floor(percentage);
            console.log("percentage: " + wholeNumberPercentage);
            timeLeftBar.style.background = 'linear-gradient(to right, var(--border2) ' + wholeNumberPercentage + '%, #ffffff ' + wholeNumberPercentage + '%)';
            if (timeLeft <= 0) {
                clearInterval(timer);
                timeLeftBar.style.background = '#ffffff';
            }
        }, 1000);
    }


    function handleAnswerOptionClick(order_number) {
        console.log("click option" + order_number)
        axios.put(`${apiBaseUrl}/v1/answer/${roomCodeLoStor}`, {
            order_number: order_number
        })
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        })
    }

    return (
        <div className='muChoPage'>
            <TopBar />
            <div className='aargh'>
                <div className='muChoQuestionImgDiv'>
                    <img onLoad={() => handleAnswerOptions()} className='muChoQuestionImg' src={question?.img_link} alt="Question" />
                </div>
                    
                
                <div className='muChoQuestionTitleDiv'>
                    <p>{question?.title}</p >
                </div>
                
                    {answerOptions?.map((answer, order_number) => (
                        <div key={order_number} ref={el => answerOptionRefs.current[order_number + 1] = el} onClick={() => handleAnswerOptionClick(order_number + 1)} className='answerOption'>
                            <p>{answer?.answer}</p>
                        </div>
                    ))}
                <div className='playerDetailsDiv'>
                    <p>{playerDetails?.name}</p>
                    <div className='timeLeftBar'></div>
                    <p>{playerDetails?.score} points</p>
                </div>
                <div className='leaderBoardBtnDiv'>
                    <button className='leaderBoardBtn' on>Leaderboard</button>
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default MuChoQuestion