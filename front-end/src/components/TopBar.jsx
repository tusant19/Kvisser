import { useState } from 'react'
import './TopBar.css'
import axios from 'axios'
import apiBaseUrl from './apiAdress.js'
import siteBaseUrl from './baseAdress.js'
import { useEffect } from 'react'

function TopBar() {
    const [loggedIn, setLoggedIn] = useState("log in")
    const [loggedInLink, setLoggedInLink] = useState(`${siteBaseUrl}/login`)

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/loginstatus`, {
            withCredentials: true
        })
        .then((res) => {
            if (res.status === 200) {
                console.log("logged in")
                setLoggedIn(res?.data?.msg)
                setLoggedInLink(`${siteBaseUrl}/logout`)
                localStorage.setItem("uuid", res.data.uuid)
            } else {
                console.log("not logged in")
                setLoggedIn(res?.data?.msg)
                setLoggedInLink(`${siteBaseUrl}/login`)
            }
        })
        .catch((error) => {
            console.log(error)
        });
    }, [])


    return (
        <div className='topBar'>
            <div className='topBarContent'>
                <a href="../">
                    <p className='title dark'>Kvisser</p>
                </a>
                
                <a href={loggedInLink}>
                    <button className='loginBtn'>{loggedIn}</button>
                </a>
            </div>
        </div>
    )
}

export default TopBar