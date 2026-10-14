import './ChangePassword.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

import { useState } from 'react';

function ChangePassword() {
    const nameRef = useRef();
    const passwordRef = useRef();
    const newPasswordRef = useRef();
    const [errorState, setErrorState] = useState(null);

    function changePassword() {
        axios.put(`${apiBaseUrl}/v1/changepassword`, {
            name: nameRef.current.value,
            password: passwordRef.current.value,
            newPassword: newPasswordRef.current.value
        }, {
            withCredentials: true
        })
        .then((res) => {
            if (res.status === 200) {
                window.history.back()
                
            }
            else if (res.status === 401) {
                setErrorState(res?.data?.error);
            }
        })
        .catch((error) => {
            console.error(error);
            setErrorState(error?.response?.data?.error || "An error occurred while changing the password.");
        })
    }

    return (
        <div className='changePasswordPage'>
            <TopBar />
            <div className='changePasswordPageMain'>
                <div className='changePasswordTitleDiv'>
                    <p className='changePasswordTitle'>Change password</p>
                </div>
                <div className='changePasswordForm'>
                    <input className='changePasswordInput' type="text" placeholder='name' ref={nameRef}/>
                    <input className='changePasswordInput' type="text" placeholder='password' ref={passwordRef}/>
                    <input className='changePasswordInput' type="text" placeholder='new password' ref={newPasswordRef}/>
                    <button className='changePasswordBtn' onClick={changePassword}>Change Password</button>
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

export default ChangePassword