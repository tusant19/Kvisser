import './BottomBar.css'
import homeSymbol from '../assets/home3B.svg'
import findSymbol from '../assets/search3B.svg'
import playSymbol from '../assets/play3B.svg'
import accountSymbol from '../assets/person3B.svg'
import siteBaseUrl from './baseAdress.js'

function BottomBar() {
    return (
        <div className='bottomBar'>
            <div className='bottomBarContent'>
                <a href={siteBaseUrl}>
                    <button className='bottomBarBtn'>
                        <img src={homeSymbol} alt="Home" />
                    </button>
                </a>
                <a href={siteBaseUrl + "/search"}>
                    <button className='bottomBarBtn'>
                        <img src={findSymbol} alt="Search" />
                    </button>
                </a>
                <a href={siteBaseUrl + "/play"}>
                    <button className='bottomBarBtn'>
                        <img src={playSymbol} alt="Play" />
                    </button>
                </a>
                <a href={siteBaseUrl + "/account"}>
                    <button className='bottomBarBtn'>
                        <img src={accountSymbol} alt="Account" />
                    </button>
                </a>
            </div>
        </div>
    )
}

export default BottomBar