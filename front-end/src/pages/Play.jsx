import './Play.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

function Play() {
    const codeRef = useRef();
    const nameRef = useRef();

    function joinRoom() {
        console.log("joinRoom");

        axios.put(`${apiBaseUrl}/v1/joinRoom`, {
            code: codeRef.current.value,
            name: nameRef.current.value
        }, {
            withCredentials: true,
            /* headers: {
                'Content-Type': 'application/json'
            } */
        })
        .then((res) => {
            if (res.status = 200) {
                console.log(res.data.playerUuid)
                localStorage.setItem("uuid", res.data.playerUuid)
                window.location.replace(`${siteBaseUrl}/waiting`)
            } else {
                console.log(res.status)
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }

    return (
        <div className='playPage'>
            <TopBar />
            <div className='playPageMain'>
                <div className='joinForm'>
                    <input className='playInput' type="text" placeholder='ab-xy' ref={codeRef} />
                    <input className='playInput' type="text" placeholder='name' ref={nameRef} />
                    <button className='playJoin' onClick={joinRoom}>Join</button>
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default Play
