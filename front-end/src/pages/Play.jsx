import './Play.css'
import Carousel from '../components/Carousel.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomBar from '../components/BottomBar.jsx'

function joinRoom() {

}

function Play() {
    
    return (
        <div className='playPage'>
            <TopBar />
            <div className='playPageMain'>
                <div className='joinForm'>
                    <input className='playInput' type="text" placeholder='ab-xy' />
                    <input className='playInput' type="text" placeholder='name' />
                    <button className='playJoin' onClick={joinRoom}>Join</button>
                </div>
            </div>
            <BottomBar />
        </div>
    )
}

export default Play
