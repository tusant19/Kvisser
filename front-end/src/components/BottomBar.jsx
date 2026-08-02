import './BottomBar.css'
import homeSymbol from '../assets/home3B.svg'
import findSymbol from '../assets/search3B.svg'
import playSymbol from '../assets/play3B.svg'
import accountSymbol from '../assets/person3B.svg'

function BottomBar() {
    return (
        <div className='bottomBar'>
            <div className='bottomBarContent'>
                <a href="./">
                    <button className='bottomBarBtn'>
                        <img src={homeSymbol} alt="Home" />
                    </button>
                </a>
                <a href="../find">
                    <button className='bottomBarBtn'>
                        <img src={findSymbol} alt="Find" />
                    </button>
                </a>
                <a href="../play">
                    <button className='bottomBarBtn'>
                        <img src={playSymbol} alt="Play" />
                    </button>
                </a>
                <a href="../account">
                    <button className='bottomBarBtn'>
                        <img src={accountSymbol} alt="Account" />
                    </button>
                </a>
            </div>
        </div>
    )
}

export default BottomBar