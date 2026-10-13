import './CreateAccount.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';
import { useState } from 'react';

function Logout() {
    function logout() {
        axios.put(`${apiBaseUrl}/v1/logout`, {}, {
            withCredentials: true
        })
        .then((res) => {
            if (res.status === 200) {
                window.location.replace(`${siteBaseUrl}/`);
            }
            else if (res.status === 401) {
                setErrorState(res?.data?.error);
            }
        })
        .catch((error) => {
            console.error(error);
            setErrorState(error?.response?.data?.error || "An error occurred while logging out.");
        })
    }

    return (
        <div className='logOutPage'>
            <TopBar />
            <div className='logOutPageMain'>
                <div className='logOutTitleDiv'>
                    <p className='logOutTitle'>Log out?</p>
                </div>
                <div className='logOutForm'>
                    <button onClick={logout} className='logOutBtn'>
                        Log out
                    </button>
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default Logout