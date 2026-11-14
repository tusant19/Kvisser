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
    const [email, setEmail] = useState("");
    const [uuid, setUuid] = useState("");


    function init() {
        axios.get(`${apiBaseUrl}/v1/loginstatus`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (res.data.loggedIn) {
                setLoggedIn(true);
            }
            axios.get(`${apiBaseUrl}/v1/account/${res.data.uuid}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                setName(res.data.name);
                setEmail(res.data.email);
                setUuid(res.data.uuid);
            })
            .catch((error) => {
                console.error(error);
            })
        })
        .catch((error) => {
            console.error(error);
        })
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
                        <p className="accountDetail">Email: {email}</p>
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