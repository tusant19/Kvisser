import './Waiting.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useState } from 'react';
import { io } from "../components/socket.js";
import { useEffect } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import { useNavigate } from 'react-router';

axios.defaults.withCredentials = true;


function Waiting() {
    const navigate = useNavigate();
    const [name, setName] = useState("user")
    const [count, setCount] = useState(0)
    const [room, setRoom] = useState(null)
    const [singularPlayer, setSingularPlayer] = useState("player")
    const [isAre, setIsAre] = useState("is")
    const [isHost, setIsHost] = useState(false)
    
    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/playerDetails`, {},
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                setName(res?.data?.name)
                if (res?.data?.name == "host") {
                    setIsHost(true)
                }

                setRoom(res?.data?.room)
                localStorage.setItem("roomCode", res?.data?.room)
                console.log(res)
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isAre, singularPlayer])
        

    let uuid = localStorage.getItem("uuid")
    

    useEffect(() => {
        if (!room) {
            return
        }

        const socket = io(apiBaseUrl)
        console.log("ran")
        socket.emit("joinRoom", room, uuid)
        socket.on("playerCount", (playerCount) => {
            console.log("pcu")
            if (playerCount > 1) {
                setSingularPlayer("players")
                setIsAre("are")
            } else {
                setSingularPlayer("player")
                setIsAre("is")
            }
            setCount(playerCount)
        })
        socket.on("nextQuestionSwap", (type) => {
            console.log("NQS")
            navigate(`/${type}`);
        })

        return () => {
            socket.off("playerCount")
            socket.disconnect();
        }
    }, [room, uuid])
    
    
    return (
        <div className='waitingPage'>
            <TopBar />
            {!isHost && <div className='waitingPageMain'>
                <div className='playerGreet'>
                    <p>Welcome {name}</p>
                    <p>the game will be starting soon</p>
                    <p>There {isAre} currently {count} {singularPlayer}</p>
                </div>
            </div>}
            {isHost && <div className='waitingPageMain'>
                <div className='playerGreet'>
                    <p>You're browser cookies have marked you as the host of the lobby</p>
                    <p>If you are testing the project please ensure that all the cookies of the browser windows you are using have seperate cookies (for example using two different browsers or a private and public browsing mode).</p>
                </div>
            </div>}
            <BottomBar />
        </div>
    )
}

export default Waiting
