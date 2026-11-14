import './Account.css';
import TopBar from '../components/TopBar.jsx';
import BottomBar from '../components/BottomBar.jsx';
import { useState, useEffect } from 'react';
import axios from "axios";
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

function Account() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [name, setName] = useState("");
    const [uuid, setUuid] = useState("");


    async function init() {
        try {
            const res = await axios.get(`${apiBaseUrl}/v1/loginstatus`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.data.msg === "Log out") {
                console.log("User is logged in");
                console.log("UUID: " + res.data.uuid);
                setLoggedIn(true);
                setUuid(res.data.uuid);
            } else {
                console.log("User is not logged in");
                setLoggedIn(false);
            }
            
        } catch (error) {
            console.error(error);
        }
        if (loggedIn) {
            try {
                const res = await axios.get(`${apiBaseUrl}/v1/account/${uuid}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setName(res.data.name);
            } catch (error) {
                console.error(error);
            }
        }
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="accountPage">
            <TopBar />
            <div className="accountPageMain">
                <div className="accountTitleDiv">
                    <p>Account Details</p>
                </div>
                {loggedIn ? (
                    <div className="accountDetailsDiv">
                        <p className="accountDetail">Name: {name}</p>
                        <p className="accountDetail">UUID: {uuid}</p>
                    </div>
                ) : (
                    <div className="accountNotLoggedInDiv">
                        <p className="accountNotLoggedInMessage">You are not logged in. Please log in with the button at the top to view your account details.</p>
                    </div>
                )}
            </div>
            <BottomBar />
        </div>
    );
}

export default Account;