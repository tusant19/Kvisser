import apiBaseUrl from "../components/apiAdress";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import "../Main.css";
import "./AnswerStatus.css";
import correctSymbol from "../assets/check_24dp_505050_FILL0_wght400_GRAD0_opsz24.svg";
import incorrectSymbol from "../assets/close_24dp_505050_FILL0_wght400_GRAD0_opsz24.svg";
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import siteBaseUrl from "../components/baseAdress";

function AnswerStatus() { 
    let roomCodeLoStor = localStorage.getItem("roomCode") 
    const { status } = useParams();
    const [answerStatus, setAnswerStatus] = useState("waiting");
    const [points, setPoints] = useState(0);
    const [placeMsg, setPlaceMsg] = useState(null);
    const playerDetails = useRef(null);
    const [symbol, setSymbol] = useState(null);
    let uuid = localStorage.getItem("uuid");
    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playerDetails`, {
            withCredentials: true
        })
        .then((response) => {
            playerDetails.current = response.data;
            setPoints(playerDetails.current?.score);
            console.log("playerDetails: ", playerDetails.current);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/answerstatus/${roomCodeLoStor}`, {
            withCredentials: true,
        })
        .then((response) => {
            if (response.data.ranOutOfTime) {
                setAnswerStatus("You ran out of time!");
                setSymbol(incorrectSymbol);
                setPoints(playerDetails.current?.score);
                setPlaceMsg("Better luck next time!");
                return;
            }
            console.log(response.data);
            setPlaceMsg(response.data.msg);
            if (response.data.status) {
                setAnswerStatus("Correct!");
                setPoints(playerDetails.current?.score);
                setSymbol(correctSymbol);
            } else {
                setAnswerStatus("Incorrect");
                setPoints(playerDetails.current?.score);
                setSymbol(incorrectSymbol);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    useEffect(() => {
        let socket = io(apiBaseUrl)
        socket.emit("joinRoom", roomCodeLoStor, uuid)
        socket.on("nextQuestionSwap", (type) => {
            console.log("NQS")
            window.location.replace(`${siteBaseUrl}/${type}`);
        });
    }, [])

    return (
        <div className="answerStatusPage">
            <TopBar />
            {status != "conflict" &&<div className="answerStatusPageMain">
                <div className="answerStatusTexts">
                    <p className="answerStatusText">{answerStatus}</p>
                    <img className="answerStatusSymbol" src={symbol} alt="answer status symbol" />
                    
                    <p className="answerStatusPoints">{points} points</p>
                    <p className="answerStatusPlace">{placeMsg}</p>
                </div>
            </div>}
            {status == "conflict" && <div className="answerStatusPageMain">
                <p className="statusErrorText">The server considers you to have already answered this question. You will still be sent to the next question normally.</p>

            </div>}
            <BottomBar />
        </div>
    )
}
            
export default AnswerStatus;

