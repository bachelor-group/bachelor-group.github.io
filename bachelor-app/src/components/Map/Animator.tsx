import { interval, timeParse } from "d3"
import { Timer } from "d3-timer"
import { useState } from "react"
import { BsPauseCircleFill, BsPlayCircleFill } from 'react-icons/bs';

export type IAnimate = ({ CurDate }: AnimatorProps) => (JSX.Element)

const TICKDURATION = 300

type AnimatorProps = {
    CurDate: string
    setDate: (date: string) => void
}

let parseTime = timeParse("%Y-%m-%d")

export const Animator = ({ CurDate, setDate }: AnimatorProps) => {

    const [ticker, setTicker] = useState<Timer>();

    async function Animate() {
        // Animation is already playing
        if (ticker !== undefined) {
            ticker.stop();
            setTicker(undefined);
        }
        else {
            let cursor = CurDate
            let tickerTemp = interval(e => {
                if (cursor >= "2022-04-05") { tickerTemp.stop(); setTicker(undefined); return };
                cursor = nextDay(cursor);
                setDate(cursor)
            }, TICKDURATION);
            setTicker(tickerTemp);
        }
    }

    function nextDay(date: string): string {
        let currentDay = parseTime(date)
        if (currentDay == null) {
            throw `Date ${date} is a invalid date`
        }
        let nextDay: Date = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1)
        let nextDayString = `${nextDay.getFullYear()}-${nextDay.getMonth() + 1 < 10 ? "0" + (nextDay.getMonth() + 1) : nextDay.getMonth() + 1}-${nextDay.getDate() < 10 ? "0" + nextDay.getDate() : nextDay.getDate()}`
        return nextDayString
    }

    return <>
        <a onClick={() => Animate()}>
            {ticker === undefined ?
                <BsPlayCircleFill style={{ position: "absolute", left: "90%", top: 15 }} size={"2rem"} color={"white"} />
                :
                <BsPauseCircleFill style={{ position: "absolute", left: "90%", top: 15 }} size={"2rem"} color={"white"} />
            }

        </a>
    </>
}

export default Animator;