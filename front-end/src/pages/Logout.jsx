import './Logout.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import referrerPath from '../components/referrerPath.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function Logout() {
    const navigate = useNavigate();
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/loginstatus`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (res.data.msg === "Log in") {
                navigate(-1)
            }
        })
        .catch((error) => {
            navigate(-1)
        });
    }, []);

    function logout() {
        axios.put(`${apiBaseUrl}/v1/logout`, {}, {
            withCredentials: true
        })
        .then((res) => {
            if (res.status === 200) {
                navigate(referrerPath('/'))
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
                <div className='logOutContainer'>
                    <div className='logOutTitleDiv'>
                        <p className='logOutTitle'>Sign out?</p>
                    </div>
                    <div className='logOutForm'>
                        <button onClick={logout} className='logOutBtn'>
                            Sign out
                        </button>
                        <button onClick={() => navigate(referrerPath('/'))} className='logOutBtn cancelBtn'>
                            Cancel
                        </button>
                    </div>
                </div>
                {errorState && (
                    <div className='errorDiv'>
                        <p className='errorText'>{errorState}</p>
                    </div>
                )}
            </div>
            <BottomBar />
        </div>
    )
}

export default Logout