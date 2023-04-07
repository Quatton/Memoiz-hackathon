import { useEffect, useState } from "react";

export const colors = {
  anger: "bg-red-700",
  disgust: "bg-green-700",
  fear: "bg-yellow-700",
  joy: "bg-blue-700",
  neutral: "bg-gray-700",
  sadness: "bg-indigo-700",
  surprise: "bg-pink-700",
};

export const textColor = {
  anger: "text-red-500",
  disgust: "text-green-500",
  fear: "text-yellow-500",
  joy: "text-blue-500",
  neutral: "text-gray-500",
  sadness: "text-indigo-500",
  surprise: "text-pink-500",
};

export const colorBorders = {
  anger: "border-red-500",
  disgust: "border-green-500",
  fear: "border-yellow-500",
  joy: "border-blue-500",
  neutral: "border-gray-500",
  sadness: "border-indigo-500",
  surprise: "border-pink-500",
};

export const colorActives = {
  anger: "bg-red-300 shadow-sm shadow-red-500",
  disgust: "bg-green-300 shadow-sm shadow-green-500",
  fear: "bg-yellow-300 shadow-sm shadow-yellow-500",
  joy: "bg-blue-300 shadow-sm shadow-blue-500",
  neutral: "bg-gray-300 shadow-sm shadow-gray-500",
  sadness: "bg-indigo-300 shadow-sm shadow-indigo-500",
  surprise: "bg-pink-300 shadow-sm shadow-pink-500",
};

export const colorActivesText = {
  anger: "text-red-700",
  disgust: "text-green-700",
  fear: "text-yellow-700",
  joy: "text-blue-700",
  neutral: "text-gray-700",
  sadness: "text-indigo-700",
  surprise: "text-pink-700",
};

export const colorActivesBorder = {
  anger: "border-red-200 border-2",
  disgust: "border-green-200 border-2",
  fear: "border-yellow-200 border-2",
  joy: "border-blue-200 border-2",
  neutral: "border-gray-200 border-2",
  sadness: "border-indigo-200 border-2",
  surprise: "border-pink-200 border-2",
};

export const colorHover = {
  anger:
    "hover:bg-red-500 hover:text-red-300 hover:border-red-500 hover:shadow-sm hover:shadow-red-500",
  disgust:
    "hover:bg-green-500 hover:text-green-300 hover:border-green-500 hover:shadow-sm hover:shadow-green-500",
  fear: "hover:bg-yellow-500 hover:text-yellow-300 hover:border-yellow-500 hover:shadow-sm hover:shadow-yellow-500",
  joy: "hover:bg-blue-500 hover:text-blue-300 hover:border-blue-500 hover:shadow-sm hover:shadow-blue-500",
  neutral:
    "hover:bg-gray-500 hover:text-gray-300 hover:border-gray-500 hover:shadow-sm hover:shadow-gray-500",
  sadness:
    "hover:bg-indigo-500 hover:text-indigo-300 hover:border-indigo-500 hover:shadow-sm hover:shadow-indigo-500",
  surprise:
    "hover:bg-pink-500 hover:text-pink-300 hover:border-pink-500 hover:shadow-sm hover:shadow-pink-500",
};

export const allMoods: EmotionType[] = [
  "anger",
  "disgust",
  "fear",
  "joy",
  "neutral",
  "sadness",
  "surprise",
];

export type EmotionType =
  | "anger"
  | "disgust"
  | "fear"
  | "joy"
  | "neutral"
  | "sadness"
  | "surprise";
const Mood = ({
  setMood,
  todayMood,
}: {
  todayMood: string | undefined;
  setMood: (x: string) => void;
}) => {
  const emojis = {
    anger: "🤬",
    disgust: "🤢",
    fear: "😨",
    joy: "😀",
    neutral: "😐",
    sadness: "😭",
    surprise: "😲",
  };

  const [clicked, setClicked] = useState<string>();
  useEffect(() => {
    if (clicked === todayMood) setClicked("");
  }, [clicked, todayMood]);
  return (
    <div className="flex w-72 flex-col items-center justify-center gap-3 rounded-xl bg-base-300 p-6 shadow-sm md:w-96">
      <h1 className="my-2 text-center text-2xl font-bold text-base-content">{`Today's Mood`}</h1>
      <div className="grid w-full grid-cols-2 items-center justify-center gap-3 text-center md:grid-cols-2">
        {allMoods.map((x) => {
          return (
            <button
              className={`
              btn ${x === clicked ? "loading" : ""} 
              ${x === todayMood ? colorActives[x] : colors[x]}
							${x === todayMood ? colorActivesText[x] : textColor[x]}
							${x === todayMood ? colorActivesBorder[x] : colorBorders[x]}
							${colorHover[x]} 
              btn-sm gap-3 

              `}
              key={x}
              onClick={() => {
                setMood(x);
                setClicked(x);
              }}
            >
              {x === clicked ? <>SAVING...</> : `${emojis[x]}${x}`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Mood;
