import './CreateAccount.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';
import { useState } from 'react';

function CreateAccount() {
    const nameRef = useRef();
    const passwordRef = useRef();
    const [errorState, setErrorState] = useState(null);

    function createAccount() {
        axios.put(`${apiBaseUrl}/v1/register`, {
            name: nameRef.current.value,
            password: passwordRef.current.value
        }, {
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
            setErrorState(error?.response?.data?.error || "An error occurred while creating the account.");
        })
    }

    return (
        <div className='createAccountPage'>
            <TopBar />
            <div className='createAccountPageMain'>
                <div className='createAccountTitleDiv'>
                    <p className='createAccountTitle'>Create account</p>
                </div>
                <div className='createAccountForm'>
                    <input className='createAccountInput' type="text" placeholder='name' ref={nameRef}/>
                    <input className='createAccountInput' type="text" placeholder='password' ref={passwordRef}/>
                    <button className='createAccountBtn' onClick={createAccount}>Create Account</button>
                </div>
                <div className='alreadyHaveAccountDiv'>
                    <a href="../login"> 
                        <p>Already have an account?</p>
                    </a>
                    
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

export default CreateAccount