import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import './HostWaiting.css';
import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import { useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import apiBaseUrl from '../components/apiAdress';
import siteBaseUrl from '../components/baseAdress';
import { useEffect } from 'react';

function HostWaiting() {
    const [roomCode, setRoomCode] = useState(null);
    const [uuid, setUuid] = useState(null);
    const [players, setPlayers] = useState([]);
     
    let { quizid } = useParams();
    console.log(quizid)
    useEffect(() => {
        axios.put(`${apiBaseUrl}/v1/host/${quizid}`, {
                withCredentials: true
            })
            .then((res) => {
                if (res.status === 200) {
                    setRoomCode(res.data.roomCode);
                    setUuid(res.data.uuid);
                    localStorage.setItem("uuid", res.data.uuid);
                    localStorage.setItem("roomCode", res.data.roomCode);
                }
            })
            .catch((error) => {
                console.error(error);
                // window.location.replace(`${siteBaseUrl}/quiz/${quizid}`);
            });
    }, [])
    

    useEffect(() => {
        if (!roomCode) {
            return
        }

        const socket = io(apiBaseUrl)
        console.log("ran")
        socket.emit("joinRoomAsHost", roomCode, uuid)
        socket.on("updatePlayers", (players) => {
            console.log(players);
            setPlayers(players)
        })

        return () => {
            socket.off("updatePlayers")
            socket.disconnect();
        }
    }, [roomCode, uuid])

    return (
        <div className='hostWaitingPage'>
            <TopBar />
            <div className='hostWaitingPageMain'>
                <div className='hostWaitingTitleDiv'>
                    <p className='hostWaitingTitle'>Waiting for players...</p>
                </div>
                <div className='roomCodeDiv'>
                    <p>{roomCode}</p>
                </div>
                <div className='playerListDiv'>
                    {players?.map((player, id) => (
                        <div className='playerListEntryDiv' key={id}>
                            <p className=''>{player?.name}</p>
                        </div>
                    ))}
                </div>
                {/*add playerlist */}
                
            </div>
            <BottomBar />
        </div>
    )
}

export default HostWaiting