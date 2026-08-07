import './Home.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'

function Home() {
    
    return (
        <div className='homePage'>
            <TopBar />
            <div className='homePageMain'>
                <Carousel path={'/v1/mostPlayed'} title={"Most played"}/>
                <Carousel path={'/v1/mostPlayed'} title={"Example"}/>
                <Carousel path={'/v1/mostPlayed'} title={"Example"}/>
                <Carousel path={'/v1/mostPlayed'} title={"Example"}/>
            </div>
            <BottomBar />
        </div>
    )
}

export default Home
