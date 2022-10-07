import React from "react"
import Dice from "./Components/Dice"
import Won from "./Components/Won"
import uniqid from 'uniqid'

// STYLESHEET
import "./App.css"

export default function App(){

    /**************STATES****************/
    const [dice, setDice] = React.useState(getDiceNum());
    const [tenzies, setTenzies] = React.useState(false)
    const [duration, setDuration] = React.useState(0);
    const [startGame, setStartGame] = React.useState(false);
    const [bestTime, setBestTime] = React.useState(localStorage.getItem("bestTime") || 0)

  
    /**************USE EFFECTS****************/
    //Effect to run if game is finished and all conditions met
    React.useEffect(()=>{
        const isAllHeld = dice.every(dice => dice.isHeld);
        const firstDice = dice[0].value;
        const isAllSameValue = dice.every(dice => dice.value === firstDice);
        if(isAllHeld && isAllSameValue) {
            setTenzies(true);
            setStartGame(false);
            setBestTime(duration);
        }
    }, [dice])

    //Effect to run timer
    React.useEffect(()=>{
        let timer;
        if(startGame){
            timer = setInterval(() => {
                setDuration(duration => duration + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [startGame]);

    //Effect to save bestscore in localstorage
    React.useEffect(() => {
        if(duration < bestTime) {
            localStorage.setItem("bestTime", bestTime)
        }
    }, [bestTime])

    /**************FUNCTIONS****************/

    function beginGame() {
        setStartGame(true)
    }

    function getRandomNum(){
        let randomNum = Math.ceil(Math.random() * 6)
        return randomNum
    }

    function getDiceNum(){
        const diceArray = []
        for (let i = 0; i < 10; i++){
            let randomNum ={id: uniqid(), value: getRandomNum(), isHeld: false}
            diceArray.push(randomNum);
        }
        return diceArray
    }

    function rollDice(){
        if(tenzies) {
            setDice(getDiceNum);
            setTenzies(false);
            setDuration(0)
        }
        else {
            setDice(oldDice => oldDice.map(dice => {
                return dice.isHeld ? dice : {...dice, value: getRandomNum()}
            }))
        }
    }

    function selectDice(id){
       setDice(oldDice => oldDice.map(dice => {
        if(tenzies) {
            return dice
        }
        else {
            return dice.id === id ? {...dice, isHeld: !dice.isHeld} : dice
        }
        
       }))
    }

    function convertToTimeFormat(num) {
        let time = new Date(0);
        time.setSeconds(num);
        let timeString = time.toISOString().substring(14, 19);
        return timeString
    }

    function resetBestTime() {
        localStorage.removeItem("bestTime");
        setBestTime(0);
    }

    /**************JSX ELEMENTS****************/
    const diceElement = dice.map(die => {
                                    return <Dice 
                                    key={die.id} 
                                    id={die.id} 
                                    value={die.value} 
                                    isHeld={die.isHeld} 
                                    handleSelect={()=>selectDice(die.id)}/>
    })
    const game = () => {
        if(!tenzies) {
            if(!startGame){
                return (
                    <>
                        <button className="roll--btn" onClick={beginGame}> Start Game</button>
                    </>
                )
            }
            else {
                return (
                    <div className="dice--container">
                        {diceElement}
                    </div>
                )
            }
        }
    }

    /**************JSX****************/
    return (
       <div className="container flex">
            <div className="game--container flex">
                <h1>Tenzies</h1>
                
                { tenzies ? 
                    <Won />:
                    <div className="game--content">
                        <p className="game--desc">Roll until all dice are the same. Click each die to freeze it
                            at its current value between rolls
                        </p>
                        {game()}
                    </div>
                }
                {!startGame && !tenzies ? "" :<button className="roll--btn" onClick={rollDice}>{tenzies ? "New Game" : "Roll"}</button>}
            </div>
            <div className="time--container flex">
                <div>
                    <h4>Time Elapsed</h4>
                    <h1>{convertToTimeFormat(duration)}</h1>
                </div>
                
                <div className="best-time--container">
                    <h3>Best Time:</h3>
                    <h2>{convertToTimeFormat(bestTime)}</h2>
                    <button className="roll--btn" onClick={resetBestTime}>Reset</button>
                </div>
            </div>
       </div> 
    )
}
