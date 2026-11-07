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
    const isHost = useRef(null)
    const [question, setQuestion] = useState(null)
    const [answerOptions, setAnswerOptions] = useState([])
    const [answerCount, setAnswerCount] = useState("0 answers")
    let roomCodeLoStor = localStorage.getItem("roomCode")
    const [roomCode, setRoomCode] = useState(roomCodeLoStor)
    const timeLeftBar = useRef(null);
    const hostTimeLeftBar = useRef(null);
    const playerCount = useRef(0);
    
    let answerOptionRefs = useRef([]);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playercount/${roomCodeLoStor}`, {
            withCredentials: true
        })
        .then((response) => {
            playerCount.current = response.data.count;
            console.log("playerCount: ", playerCount.current);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

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
        axios.get(`${apiBaseUrl}/v1/role`, {
            withCredentials: true
        })
        .then((response) => {
            isHost.current = response.data.role === "host";
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        const uuid = localStorage.getItem("uuid")
        const roomCodeLoStor = localStorage.getItem("roomCode")
        if (isHost === null) return
        if (!roomCodeLoStor) return
        if (!uuid) return
        const socket = io(apiBaseUrl)
        if (isHost) {
            console.log("joining room as host: " + roomCodeLoStor)
            socket.emit("joinRoomAsHost", roomCodeLoStor, uuid)
        } else {
            console.log("joining room as player: " + roomCodeLoStor)
            socket.emit("joinRoom", roomCodeLoStor, uuid)
        } 
        socket.on("answerCount", (count) => {
            console.log("answerCount: " + count)
            if (count > 1) {
                setAnswerCount(count + " answers")
            } else {
                setAnswerCount(count + " answer")
            }
        })
        return () => socket.disconnect()
    }, [isHost, roomCodeLoStor])

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
    
    function setupTimerBar(seconds) {
        let timeLeft = seconds;
        const timer = setInterval(() => {
            timeLeft -= 1;
            let percentage = (timeLeft / seconds) * 100;
            let wholeNumberPercentage = Math.floor(percentage);
            if (wholeNumberPercentage < 0) {
                wholeNumberPercentage = 0;
                timeLeft = 0;
            }
            if (isHost.current) {
                hostTimeLeftBar.current.style.background = 'linear-gradient(to right, var(--border2) ' + wholeNumberPercentage + '%, #ffffff ' + wholeNumberPercentage + '%)';
            } else {
                timeLeftBar.current.style.background = 'linear-gradient(to right, var(--border2) ' + wholeNumberPercentage + '%, #ffffff ' + wholeNumberPercentage + '%)';
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (isHost.current) {
                    hostTimeLeftBar.current.style.background = '#ffffff';
                } else {
                    timeLeftBar.current.style.background = '#ffffff';
                }
            }
        }, 1000);
    }


    function handleAnswerOptionClick(order_number) {
        console.log("isHost: " + isHost.current)
        if (!roomCodeLoStor || isHost.current) {
            return;
        }

        console.log("click option" + order_number)
        axios.put(`${apiBaseUrl}/v1/answer/${roomCodeLoStor}`, {
            order_number: order_number
        })
        .then((response) => {
            console.log(response.data);
            if (response.status === 200) {
                if (response.data.correct) {
                    //redirect to correct answer page
                    window.location.replace(`${siteBaseUrl}/answer/correct`);
                } else {
                    //redirect to incorrect answer page
                    window.location.replace(`${siteBaseUrl}/answer/incorrect`);
                }
            } else if (response.status === 409) {
                //redirect to already answered page
                window.location.replace(`${siteBaseUrl}/answer/conflict`);
            }
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

                <div className='muChoQuestionAnswerCountDiv'>
                    <p>{answerCount}</p>
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
                    <div ref={timeLeftBar} className='timeLeftBar'></div>
                    <p>{playerDetails?.score} points</p>
                </div>
                {isHost.current && <div className='hostDetailsDiv'>
                    {isHost.current && <p>{playerDetails?.name}</p>}
                    {isHost.current && <div ref={hostTimeLeftBar} className='hostTimeLeftBar'></div>}
                    {isHost.current && <p>{roomCode}</p>}
                </div>}
                <div className='leaderBoardBtnDiv'>
                    {isHost.current && <button className='leaderBoardBtn' on>Leaderboard</button>}
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default MuChoQuestion
