import { useEffect, useState } from "react";

export const colors = {
    "anger": "bg-red-300",
    "disgust": "bg-green-300",
    "fear": "bg-yellow-300",
    "joy": "bg-blue-300",
    "neutral": "bg-gray-300",
    "sadness": "bg-indigo-300",
    "surprise": "bg-pink-300",
};
export const allMoods: EmotionType[] = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']

export type EmotionType = 'anger' | 'disgust' | 'fear' | 'joy' | 'neutral' | 'sadness' | 'surprise'
const Mood = ({ setMood, todayMood }: { todayMood: string | undefined, setMood: (x: string) => void }) => {

    const emojis = { "anger": "🤬", "disgust": "🤢", "fear": "😨", "joy": "😀", "neutral": "😐", "sadness": "😭", "surprise": '😲' }

    const [clicked, setClicked] = useState<string>()
    useEffect(() => { if (clicked === todayMood) setClicked('') }, [clicked, todayMood])
    return (
        <div className="flex flex-col justify-center items-center gap-3 w-72 md:w-96 rounded-xl bg-base-300 p-6 shadow-md">
            <h1 className="text-center text-2xl font-bold text-base-content my-2">{`Today's Mood`}</h1>
            <div className="w-full grid grid-cols-2 md:grid-cols-2 text-center justify-center items-center gap-3">
                {allMoods.map((x) => {
                    return (
                        <button
                            className={`btn ${x === clicked ? 'loading' : ''} ${todayMood && x == todayMood ? 'btn-primary' : 'btn-accent'}  btn-sm gap-3`}
                            key={x}
                            onClick={() => {
                                setMood(x)
                                setClicked(x)
                            }}
                        >
                            {x === clicked ? <>SAVING...</> : `${emojis[x]}${x}`}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Mood;