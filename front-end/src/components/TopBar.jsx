import './TopBar.css'

function TopBar() {
    return (
        <div className='topBar'>
            <div className='topBarContent'>
                <a href="../">
                    <p className='title dark'>Kvisser</p>
                </a>
                
                <a href="./login">
                    <button className='loginBtn'>Log in</button>
                </a>
            </div>
        </div>
    )
}

export default TopBar