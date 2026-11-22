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
import correctSymbol from "../assets/check_24dp_505050_FILL0_wght400_GRAD0_opsz24.svg"
import noImg from '../assets/noImg.png'
import pseudoRandomizeArrayOrder from '../components/pseudoRand.js';


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
    const latestAnswerCount = useRef(0);
    const [roleLoaded, setRoleLoaded] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [results, setResults] = useState(null);
    const answerResultBarRefs = useRef([]);
    const answerOptionColorSpotRefs = useRef([]);
    const answerResultBarDivRef = useRef(null);
    
    let answerOptionRefs = useRef([]);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playercount/${roomCodeLoStor}`, {
            withCredentials: true
        })
        .then((response) => {
            playerCount.current = response.data.count;
            console.log("playerCount: ", playerCount.current);
            setAnswerCount("0/" + playerCount.current + " answers")
            if (isHost.current && latestAnswerCount.current >= playerCount.current) {
                getResults();
                setIsFinalized(true);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }, [isFinalized, roomCodeLoStor, playerCount.current]);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/question/${roomCodeLoStor}`, {
            withCredentials: true
        })
        .then((response) => {
            console.log(response.data.question);
            setQuestion(response.data.question);
            console.log(response.data.answerOptions);
            let answerOptions = response.data.answerOptions;
            console.log("before randomize: ", answerOptions);
            if (response.data.question.randomize_order) {
                answerOptions = pseudoRandomizeArrayOrder(answerOptions, response.data.question.text);
            }
            console.log("after randomize: ", answerOptions);
            setAnswerOptions(answerOptions);
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
            setRoleLoaded(true);
            if (isHost.current && latestAnswerCount.current >= playerCount.current) {
                getResults();
                setIsFinalized(true);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        const uuid = localStorage.getItem("uuid")
        const roomCodeLoStor = localStorage.getItem("roomCode")
        if (!roleLoaded) return
        if (!roomCodeLoStor) return
        if (!uuid) return
        const socket = io(apiBaseUrl)
        if (isHost.current) {
            console.log("joining room as host: " + roomCodeLoStor)
            socket.emit("joinRoomAsHost", roomCodeLoStor, uuid)
        } else {
            console.log("joining room as player: " + roomCodeLoStor)
            socket.emit("joinRoom", roomCodeLoStor, uuid)
        } 
        socket.on("answerCount", (count) => {
            console.log("answerCount: " + count)
            latestAnswerCount.current = count;
            if (playerCount.current > 1) {
                setAnswerCount(count + "/" + playerCount.current + " answers")
            } else {
                setAnswerCount(count + "/" + playerCount.current + " answer")
            }
            if (isHost.current && count >= playerCount.current) {
                getResults();
                setIsFinalized(true);
            }
            
        })
        socket.on("skipQuestion", (type) => {
            console.log("skipQuestion: " + type)
            window.location.replace(`${siteBaseUrl}/${type}`);
        })
        return () => socket.disconnect()
    }, [roleLoaded, roomCodeLoStor])

    function handleAnswerOptions() {   
        if (answerOptions?.length > 0) {
            if (answerOptions?.length == 1) {
                if (answerOptionRefs.current[1]) {
                    answerOptionRefs.current[1].style.gridRow = "7";
                    answerOptionRefs.current[1].style.gridColumn = "2 / span 3";
                }
            } else if (answerOptions?.length == 2) {
                if (answerOptionRefs.current[1]) {
                    answerOptionRefs.current[1].style.gridRow = "7";
                    answerOptionRefs.current[1].style.gridColumn = "2";
                }
                if (answerOptionRefs.current[2]) {
                    answerOptionRefs.current[2].style.gridRow = "7";
                    answerOptionRefs.current[2].style.gridColumn = "4";
                }
            } else if (answerOptions?.length == 3) {
                if (answerOptionRefs.current[1]) {
                    answerOptionRefs.current[1].style.gridRow = "7";
                    answerOptionRefs.current[1].style.gridColumn = "2";
                }
                if (answerOptionRefs.current[2]) {
                    answerOptionRefs.current[2].style.gridRow = "7";
                    answerOptionRefs.current[2].style.gridColumn = "4";
                }
                if (answerOptionRefs.current[3]) {
                    answerOptionRefs.current[3].style.gridRow = "9";
                    answerOptionRefs.current[3].style.gridColumn = "2 / span 3";
                }
            } else if (answerOptions?.length >= 4) {
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
                    if (answerOptionRefs.current[i + 1]) {
                        answerOptionRefs.current[i + 1].style.gridRow = `${row}`;
                        answerOptionRefs.current[i + 1].style.gridColumn = `${column}`;
                    }
                }
            }
        }
        //set bg colors
        for (let i = 0; i < answerOptions?.length; i++) {
            let color;
            if (i == 0) {
                color = "var(--answer1)"
            } else if (i == 1) {
                color = "var(--answer2)"
            } else if (i == 2) {
                color = "var(--answer3)"
            } else if (i == 3) {
                color = "var(--answer4)"
            }
            if (answerOptionColorSpotRefs.current[i + 1]) {
                answerOptionColorSpotRefs.current[i + 1].style.backgroundColor = color;
            }
        }
    }

    useEffect(() => {
        handleAnswerOptions();
    }, [answerOptions]);
    
    function setupTimerBar(seconds) {
        let hasSentLateAnswer = false;
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
                if (!hasSentLateAnswer && !isHost.current) {
                    axios.put(`${apiBaseUrl}/v1/autolateanswer/${roomCodeLoStor}`, {
                        withCredentials: true
                    })
                    .then((res) => {
                        hasSentLateAnswer = true;
                        window.location.replace(`${siteBaseUrl}/answer/late`);
                    })
                    .catch((error) => {
                        console.error(error);
                        window.location.replace(`${siteBaseUrl}/answer/late`);
                    })
                } else if (!hasSentLateAnswer && isHost.current) {
                    getResults();
                    setIsFinalized(true);
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
        .then((res) => {
            console.log(res.data);
            if (res.status === 200) {
                if (res.data.correct) {
                    //redirect to correct answer page
                    window.location.replace(`${siteBaseUrl}/answer/correct`);
                } else {
                    //redirect to incorrect answer page
                    window.location.replace(`${siteBaseUrl}/answer/incorrect`);
                }
            } else if (res.status == 409) {
                //redirect to already answered page
                window.location.replace(`${siteBaseUrl}/answer/conflict`);
            }
        })
        .catch((error) => {
            if (error.response && error.response.status === 409) {
                //redirect to already answered page
                window.location.replace(`${siteBaseUrl}/answer/conflict`);
            } else {
                window.location.replace(`${siteBaseUrl}/answer/error`);
            }
            console.error(error);
        })
    }

    function setTimerBarEmpty() {
        if (isHost.current) {
            hostTimeLeftBar.current.style.display = 'none';
        } else {
            timeLeftBar.current.style.display = 'none';
        }
    }

    function getResults() {
        setTimerBarEmpty();
        axios.get(`${apiBaseUrl}/v1/multiplechoiceanswers/${roomCodeLoStor}`, {
            withCredentials: true
        })
        .then((response) => {
            console.log(response.data);
            setResults(response.data.answerCounts);            
            setBarSizes();
        })
        .catch((error) => {
            console.error(error);
        })
    }

    function setBarSizes() {
        let barElements = answerResultBarRefs.current;
        if (barElements.length === 0 && isFinalized) {
            answerResultBarDivRef.current.setHTML("<p class='noAnswersText'>No answers were submitted.</p>");
            return;
        }

        if (results) {
            let maxheight = 0.35;
            let totalCount = results.reduce((acc, result) => acc + result.count, 0);
            if (totalCount === 0) {
                totalCount = 1;
            }
            results.forEach((result, index) => {
                let percentage = (result.count / totalCount) * 100;
                if (percentage < 20) {
                    percentage = 20;
                }
                console.log("percentage: " + percentage)
                answerResultBarRefs.current[index].style.height = percentage * maxheight + "vh";
                answerResultBarRefs.current[index].style.width = 80 / results.length + "vw";
                
            });
        }
    }

    useEffect(() => {
        setBarSizes();
    }, [results]);

    function handleLeaderboardClick() {
        window.location.replace(`${siteBaseUrl}/leaderboard`);
    }

    function handleSkip() {
        if (!isHost.current) {
            return;
        }
        const socket = io(apiBaseUrl);
        socket.emit("skipQuestion", roomCodeLoStor, localStorage.getItem("uuid"))
    }

    return (
        <div className='muChoPage'>
            <TopBar />
            <div className='aargh'>
                {!isFinalized && <div className='muChoQuestionImgDiv'>
                    <img onLoad={() => handleAnswerOptions()} className='muChoQuestionImg' src={question?.img_link || noImg} alt="Question" />
                </div>}
                {isHost.current && isFinalized && <div className='finalizedDiv'>
                    <div className='muChoAnswerResultBarsDiv' ref={answerResultBarDivRef}>
                        {results?.map((result, index) => (
                            <div ref={el => answerResultBarRefs.current[index] = el} onLoad={() => console.log(result)} key={index} style={{ backgroundColor: `var(--answer${index + 1})`, border: `solid white 2px` }} className='muChoAnswerResultBarDiv'>
                                {result?.correct && <img src={correctSymbol} alt="Correct" style={{ height: 'min(48px, 4vw)', width: 'min(48px, 4vw)' }} />}
                                <p className='answerResultCount'>{result?.count}</p>
                            </div>
                        ))}
                    </div>
                </div>}

                {!isFinalized && <div className='muChoQuestionAnswerCountDiv'>
                    <p>{answerCount}</p>
                </div>}
                    
                
                <div className='muChoQuestionTitleDiv'>
                    <p>{question?.title}</p >
                </div>
                
                    {answerOptions?.map((answer, order_number) => (
                        <div key={order_number} ref={el => answerOptionRefs.current[order_number + 1] = el} onClick={() => handleAnswerOptionClick(order_number + 1)} className='answerOption'>
                            <p>{answer?.answer}</p>
                            <div className='muChoAnswerOptionColorSpot' ref={el => answerOptionColorSpotRefs.current[order_number + 1] = el}></div>
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
                <div className='skipButtonDiv'>
                    {isHost.current && !isFinalized && <button className='skipButton' onClick={handleSkip}>Skip</button>}
                </div>
                <div className='leaderBoardBtnDiv'>
                    {isHost.current && isFinalized && <button className='leaderBoardBtn' onClick={handleLeaderboardClick}>Leaderboard</button>}
                </div>
            </div>
            
            <BottomBar />
        </div>
    )
}

export default MuChoQuestion
