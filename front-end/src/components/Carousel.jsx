import axios from "axios";
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import chevronL from '../assets/chevron60L.svg';
import chevronR from '../assets/chevron60R.svg';
import './Carousel.css'

function Carousel() {
    const [carouselData, setCarouselData] = useState([])
    const [currentItem, setCurrentItem] = useState(0)
    const carouselDivRef = useRef()
    const carouselItemRefs = useRef([])
    const carouselItemWidths = useRef([]);
    let offset = useRef(0);

    addEventListener("resize", (event) => {
        carouselDivRef.current.style.transform = `translateX(-${
            0
            
        }px)`;
        setCurrentItem(0)
    })

    useEffect(() => {
        axios.get("http://localhost:8080/").then((res) => {
            setCarouselData(res.data.examplelist)
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            setCurrentItem(1)
            setCurrentItem(0)
        });
    }, [])

    const getItemSizes = () => {
        carouselItemRefs.current.forEach((el, id) => {
            let carouselItemStyle = window.getComputedStyle(el)
            let carouselItemMargins = parseFloat(carouselItemStyle.getPropertyValue('margin-right')) + parseFloat(carouselItemStyle.getPropertyValue('margin-left'))
            carouselItemWidths.current[id] = parseFloat(el.getBoundingClientRect().width) + carouselItemMargins;
            console.log("id: " + id + " width: " + (parseFloat(el.getBoundingClientRect().width) + carouselItemMargins))
            //console.log(carouselItemWidths[id])
            // console.log(carouselItemRefs.current[el.id].getBoundingClientRect())
            //console.log(el.getBoundingClientRect())
        })
    };

    function previousSlide() {
        if (currentItem > 0) {
            console.log(currentItem)
            offset.current = parseFloat(offset.current) - parseFloat(carouselItemWidths.current[currentItem - 1])
            console.log(offset.current)
            setCurrentItem(item => item - 1)
            carouselDivRef.current.style.transform = `translateX(-${
                offset.current
            }px)`;
        }
    } 

    function nextSlide() {
        if (carouselItemWidths.current[currentItem + 1] != null) {
            offset.current = parseFloat(offset.current) + parseFloat(carouselItemWidths.current[currentItem])
            console.log(offset.current)
            setCurrentItem(item => item + 1)
        
            carouselDivRef.current.style.transform = `translateX(-${
            offset.current
            }px)`;
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