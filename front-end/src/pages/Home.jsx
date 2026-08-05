import './Home.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'

function Koti() {
    
    return (
        <div className='homePage'>
            <TopBar />
            <div className='homePageMain'>
                <Carousel path={'/'}/>
                <Carousel path={'/'}/>
                <Carousel path={'/'}/>
                <Carousel path={'/'}/>

            </div>
            <BottomBar />
        </div>
    )
}

export default Koti
