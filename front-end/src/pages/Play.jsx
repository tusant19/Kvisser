import './Play.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';

function Play() {
    const codeRef = useRef();
    const nameRef = useRef();

    function joinRoom() {
        console.log("joinRoom")
        let apiBaseUrl = "";
        let siteBaseUrl = "";

        if (import.meta.env.DEV) {
            if (import.meta.env.VITE_API_DEV_BASE_URL != null) {
                apiBaseUrl = import.meta.env.VITE_API_DEV_BASE_URL;
                siteBaseUrl = import.meta.env.VITE_DEV_SITE_BASE_URL;
            }
        }
        else {
            if (import.meta.env.VITE_API_PROD_BASE_URL != null) {
                apiBaseUrl = import.meta.env.VITE_API_PROD_BASE_URL;
                siteBaseUrl = import.meta.env.VITE_SITE_BASE_URL;
            }
        }

        axios.put(`${apiBaseUrl}/v1/joinRoom`, {
            code: codeRef.current.value,
            name: nameRef.current.value
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (res.status = 200) {
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
