import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import './Search.css';
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import apiBaseUrl from '../components/apiAdress.js';
import siteBaseUrl from '../components/baseAdress.js';

function Search() {
    const searchInputRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);

    function handleSearch() {
        const query = searchInputRef.current.value;
        axios.get(`${apiBaseUrl}/v1/search/${query}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setSearchResults(res.data);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    return (
        <div className="searchPage">
            <TopBar />
            <div className="searchPageMain">
                <input type="text" placeholder="Search..." ref={searchInputRef} className="searchPageInput" />
                <button className="searchPageButton" onClick={handleSearch}>Search</button>
            </div>
            <BottomBar />
        </div>
    );
}

export default Search;