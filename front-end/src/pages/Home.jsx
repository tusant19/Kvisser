import './Home.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/topBar.jsx'

function Koti() {
    
    return (
        <div className='homePage'>
            <TopBar />
            <div className='homePageMain'>
                <Carousel />
            </div>
        </div>
    )
}

export default Koti
