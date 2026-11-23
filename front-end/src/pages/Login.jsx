import './Login.css'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'
import axios from "axios";
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import apiBaseUrl from '../components/apiAdress.js';
import referrerPath from '../components/referrerPath.js';
import { useState } from 'react';

function Login() {
    const navigate = useNavigate();
    const nameRef = useRef();
    const passwordRef = useRef();
    const [errorState, setErrorState] = useState(null);

    function logIn() {
        axios.put(`${apiBaseUrl}/v1/login`, {
            name: nameRef.current.value,
            password: passwordRef.current.value
        }, {
            withCredentials: true
        })
        .then((res) => {
            if (res.status === 200) {
                navigate(referrerPath('/'))
            }
            console.log(res.status)
        })
        .catch((error) => {
            console.log(error)
            setErrorState(error?.response?.data?.error);
        })
    }

    return (
        <div className='loginPage'>
            <TopBar />
            <div className='loginPageMain'>
                <div className='loginContainer'>
                    <div className='loginTitleDiv'>
                        <p className='loginTitle'>Login</p>
                    </div>
                    <div className='loginForm'>
                        <input className='loginInput' type="text" placeholder='name' ref={nameRef}/>
                        <input className='loginInput' type="text" placeholder='password' ref={passwordRef}/>
                        <button className='loginPageBtn' onClick={logIn}>Login</button>
                    </div>
                    
                </div>
                    <div className='noAccountDiv'>
                        <a href="../register">
                            <p>Don't have an account yet?</p>
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

export default Login
