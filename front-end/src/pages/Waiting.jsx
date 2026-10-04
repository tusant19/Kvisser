import './Waiting.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { use, useState } from 'react';
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import { useEffect } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

axios.defaults.withCredentials = true;


function Waiting() {
    const [name, setName] = useState("user")
    const [count, setCount] = useState(0)
    const [room, setRoom] = useState(null)
    
    
    

    console.log(apiBaseUrl)
    

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
                setRoom(res?.data?.room)
                console.log(res)
            })
            .catch((error) => {
                console.error(error);
            });
    }, [])
        

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
            setCount(playerCount)
        })

        return () => {
            socket.off("playerCount")
            socket.disconnect();
        }
    }, [room, uuid])
        

    
    
    return (
        <div className='waitingPage'>
            <TopBar />
            <div className='waitingPageMain'>
                <div className='playerGreet'>
                    <p>Welcome {name} to {room} </p>
                    <p>the game will be starting soon</p>
                    <p>There are currently {count} players</p>
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default Waiting
