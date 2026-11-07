import apiBaseUrl from "../components/apiAdress";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import "../Main.css";
import "./AnswerStatus.css";

function AnswerStatus() {
    let roomCodeLoStor = localStorage.getItem("roomCode") 
    const { status } = useParams();
    const [answerStatus, setAnswerStatus] = useState("waiting");
    const [points, setPoints] = useState(0);
    const [placeMsg, setPlaceMsg] = useState(null);
    const playerDetails = useRef(null);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playerDetails`, {
            withCredentials: true
        })
        .then((response) => {
            playerDetails.current = response.data;
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
            console.log(response.data);
            setPlaceMsg(response.data.msg);
            if (response.data.status) {
                setAnswerStatus("You answered correctly!");
                setPoints(playerDetails.current?.score);
            } else {
                setAnswerStatus("Your answer was incorrect");
                setPoints(playerDetails.current?.score);
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }, [])

    return (
        <div className="answerStatusPage">
            <TopBar />
            <div className="answerStatusPageMain">
                <p className="answerStatusText">{answerStatus}</p>
                <p className="answerStatusPoints">You currently have {points} points</p>
                <p className="answerStatusPlace">{placeMsg}</p>
            </div>
            <BottomBar />
        </div>
    )
}
            
export default AnswerStatus;

