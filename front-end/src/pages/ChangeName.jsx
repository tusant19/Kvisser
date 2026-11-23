import axios from 'axios';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import apiBaseUrl from '../components/apiAdress.js';
import BottomBar from '../components/BottomBar';
import siteBaseUrl from '../components/baseAdress.js';
import './ChangeName.css';

function ChangeName() {
    const [name, setName] = useState('');
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`${apiBaseUrl}/v1/account/${localStorage.getItem('uuid')}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setName(res.data.name);
        })
        .catch((error) => {
            console.error(error);
        });
    }, []);

    function handleChangeName(e) {
        e.preventDefault();
        axios.put(`${apiBaseUrl}/v1/account/${localStorage.getItem('uuid')}/changeName`, 
        {
            newName: newName
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setMessage('Name changed successfully!');
            setName(newName);
            setNewName('');
        })
        .catch((error) => {
            console.error(error);
            setMessage('Error changing name. Please try again.');
        });
    }

    return (
        <div className="changeNamePage">
            <TopBar />
            <div className="changeNamePageMain">
                    <div className="changeNamePageFormContainer">
                    <p className="changeNameTitle">Change Name</p>
                    <p className="changeNameCurrent">Current Name: {name}</p>
                    <form onSubmit={handleChangeName} className="changeNameForm">
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter new name" className="changeNameInput" />
                        <button type="submit" className="changeNameButton">Change Name</button>
                    </form>
                    {message && <p className="changeNameMessage">{message}</p>}
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default ChangeName;