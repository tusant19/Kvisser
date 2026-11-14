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
    const [hasTried, setHasTried] = useState(false);

    function handleSearch() {
        const query = searchInputRef.current.value;
        axios.get(`${apiBaseUrl}/v1/search/${query}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setHasTried(true);
            setSearchResults(res.data.searchResults);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    return (
        <div className="searchPage">
            <TopBar />
            <div className="searchPageMain">
                <div className="searchControlsDiv">
                    <input type="text" placeholder="Search..." ref={searchInputRef} className="searchPageInput" />
                    <button className="searchPageButton" onClick={handleSearch}>Search</button>
                </div>
                <div className="searchResultsDiv">
                    {searchResults.length > 0 ? (
                        <div className="searchResultsList">
                            {searchResults.map((result, index) => (
                                <a href={`${siteBaseUrl}/quiz/${result.uuid}`} key={index} className="searchResultItemLink">
                                    <div key={index} className="searchResultItem">
                                        <img src={result.img_link} alt={result.title} className="searchResultImage" />
                                        <p className="searchResultTitle">{result.title}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="noResultsMessageDiv">
                            {hasTried ? (
                                <p className="noResultsMessage">No results found.</p>
                            ) : (
                                <p className="noResultsMessage">Type something in the search box.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default Search;