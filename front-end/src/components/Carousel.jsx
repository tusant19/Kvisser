import axios from "axios";
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import chevronL from '../assets/chevron60L.svg';
import chevronR from '../assets/chevron60R.svg';
import './Carousel.css'

function Carousel({ path }) {
    const [carouselData, setCarouselData] = useState([])
    const [currentItem, setCurrentItem] = useState(0)
    const carouselDivRef = useRef()
    const carouselItemRefs = useRef([])
    const carouselItemWidths = useRef([]);
    let offset = useRef(0);

    addEventListener("resize", (event) => {
        console.log("resize")
        carouselDivRef.current.style.transform = `translateX(-${
            0
        }px)`;
        setCurrentItem(0);
        offset.current = 0;
        getItemSizes();
    })

    useEffect(() => {
        console.log(`http://localhost:8080${path}`)
        axios.get(`http://localhost:8080${path}`).then((res) => {
            setCarouselData(res.data.examplelist)
        })
        .catch((error) => {
            console.error(error);
        })
    }, [])

    const getItemSizes = () => {
        carouselItemRefs.current.forEach((el, id) => {
            let carouselItemStyle = window.getComputedStyle(el)
            let carouselItemMargins = parseFloat(carouselItemStyle.getPropertyValue('margin-right')) + parseFloat(carouselItemStyle.getPropertyValue('margin-left'))
            carouselItemWidths.current[id] = parseFloat(el.getBoundingClientRect().width) + carouselItemMargins;
        })
    };

    function previousSlide() {
        if (currentItem > 0) {
            offset.current = parseFloat(offset.current) - parseFloat(carouselItemWidths.current[currentItem - 1])
            setCurrentItem(item => item - 1);
            carouselDivRef.current.style.transform = `translateX(-${
                offset.current
            }px)`;
            carouselDivRef.current.style.transition = `transform ${
                0.25 + (0.25 * parseFloat(carouselItemWidths.current[currentItem-1]) / 600)
            }s ease-in-out`; 
            
        }
    } 

    function nextSlide() {
        if (carouselItemWidths.current[currentItem + 1] != null) {
            offset.current = parseFloat(offset.current) + parseFloat(carouselItemWidths.current[currentItem]);
            setCurrentItem(item => item + 1)
        
            carouselDivRef.current.style.transform = `translateX(-${
            offset.current
            }px)`;
            carouselDivRef.current.style.transition = `transform ${
                0.25 + (0.25 * parseFloat(carouselItemWidths.current[currentItem]) / 600)
            }s ease-in-out`; 
        } 
    }

    return (
        <div className="carouselContainer">
            <div className='navL'>
                <button onClick={previousSlide} className='navLBtn'>
                    <img className="chevronL" src={chevronL} alt="<" />
                </button>
            </div>
            <div className="carouselWrapper">
                <div className='carousel' ref={carouselDivRef}>
                    {carouselData.map((carouselItem, id) => (
                        <div className="carouselItem" key={id} ref={el => (carouselItemRefs.current[id] = el)}>
                                <img className="carouselImg" src={carouselItem.  imglink} onLoad={getItemSizes} alt="quiz image" />
                            <p className="carouselItemTitle">{carouselItem.title}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className='navR'>
                <button className='navRBtn' onClick={nextSlide}>
                    <img className='chevronR' src={chevronR} alt=">" />
                </button>
            </div>
            
            
        </div>
    )
}

export default Carousel