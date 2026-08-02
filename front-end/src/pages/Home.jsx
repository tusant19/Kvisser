import './Home.css'
import Carousel from '../components/Carousel.jsx'

function Koti() {
    
    return (
        <div className='homePage'>
            <div className='topBar'>
                <div className='topBarContent'>
                    <p className='title dark'>Kvisser</p>
                    <a href="./login">
                        <button className='loginBtn dark'>Log in</button>
                    </a>
                </div>
            </div>
            <div className='homePageMain'>
                <Carousel />
            </div>
        </div>
    )
}

export default Koti
