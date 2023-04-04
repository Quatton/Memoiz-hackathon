import { useState } from "react";

export const colors = {
    'happy': 'bg-yellow-100',
    'sad': 'bg-purple-200'
}
const Mood = () => {
    const moods: ('happy' | 'sad')[] = ['happy', 'sad']

    return (
        <div className="flex flex-col justify-center items-center gap-3 w-72 md:w-96 rounded-xl bg-white p-3 shadow-md">
            <h1 className="text-center text-lg font-semibold text-primary">{`Today's Mood`}</h1>
            <div className="w-fit grid grid-cols-2 text-center justify-center items-center gap-3">
                {moods.map((x) => {
                    return (
                        <button
                            className={`btn btn-info btn-sm flex items-center text-center justify-center rounded-md  text-white`}
                            key={x}
                        >
                            {x}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Mood;