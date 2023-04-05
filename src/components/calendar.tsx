import { useCallback, useMemo, useState } from "react";
import dayjs from 'dayjs';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { colors } from "./Mood";
type Dayjs = dayjs.Dayjs
const Calendar = ({ onClick, moods, selecting }: {
    onClick: (day: Date) => void, moods: { [key: string]: "happy" | "sad" }, selecting: (Date | undefined)
}) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    const currentDay = useMemo(() => dayjs().toDate(), []);

    const firstDayOfTheMonth = useMemo(
        () => selectedDate.clone().startOf("month"),
        [selectedDate]
    );

    const firstDayOfFirstWeekOfMonth = useMemo(
        () => dayjs(firstDayOfTheMonth).startOf("week"),
        [firstDayOfTheMonth]
    );

    const generateFirstDayOfEachWeek = useCallback((day: Dayjs): Dayjs[] => {
        const dates: Dayjs[] = [day];
        for (let i = 1; i < 6; i++) {
            const date = day.clone().add(i, "week");
            dates.push(date);
        }
        return dates;
    }, []);

    const generateWeek = useCallback((day: Dayjs): Date[] => {
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = day.clone().add(i, "day").toDate();
            dates.push(date);
        }
        return dates;
    }, []);


    const generateWeeksOfTheMonth = useMemo((): Date[][] => {
        const firstDayOfEachWeek = generateFirstDayOfEachWeek(
            firstDayOfFirstWeekOfMonth
        );
        return firstDayOfEachWeek.map((date) => generateWeek(date));
    }, [generateFirstDayOfEachWeek, firstDayOfFirstWeekOfMonth, generateWeek]);




    return (
        <div className="flex flex-col gap-2 justify-center items-center">
            <div className="bg-primary-content w-72 md:w-96 p-3 md:p-6 rounded-xl ">
                <div className="flex justify-between items-center">
                    <MdKeyboardArrowLeft
                        className="text-secondary hover:cursor-pointer hover:text-secondary-focus"
                        size={25}
                        onClick={() => setSelectedDate((date) => date.subtract(1, "month"))}
                    />
                    <h3 className="text-primary font-bold">{selectedDate.clone().format("MMM YYYY")}</h3>
                    <MdKeyboardArrowRight
                        className="text-secondary hover:cursor-pointer hover:text-secondary-focus"
                        size={25}
                        onClick={() => setSelectedDate((date) => date.add(1, "month"))}
                    />
                </div>
                <div className="flex justify-between">
                    {generateWeeksOfTheMonth[0] && generateWeeksOfTheMonth[0].map((day, index) => (
                        <div key={`week-day-${index}`} className="h-8 w-8 flex justify-center items-center text-info">
                            {dayjs(day).format("dd")}
                        </div>
                    ))}
                </div>
                {
                    generateWeeksOfTheMonth.map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="flex justify-between">
                            {week.map((day, dayIndex) => {
                                let bgColor = ""
                                const isSameMonth = selectedDate.clone().toDate().getMonth() !== day.getMonth()

                                const dayStr = dayjs(day).format("YYYY/MM/DD")
                                const isToday = dayjs(currentDay).isSame(day, "date")
                                if (moods[dayStr] != undefined) {
                                    if (moods[dayStr] === 'happy') bgColor = colors['happy']
                                    else if (moods[dayStr] === 'sad') bgColor = colors['sad']
                                }

                                return (
                                    <div className={`w-8 h-8 text-center transition-colors rounded-md flex justify-center items-center
                                     hover:cursor-pointer hover:bg-primary-focus 
                                    ${isSameMonth ? "text-gray-200 hover:text-white"
                                            :
                                            isToday ? "text-red-500 hover:text-red-400"
                                                : "text-gray-500 hover:text-white"}
                                    ${bgColor}
                                    `}
                                        key={`day-${dayIndex}`}
                                        onClick={() => { onClick(day) }}
                                    >
                                        {day.getDate()}
                                    </div>
                                )
                            })}
                        </div>
                    ))
                }
            </div >
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md ${colors['happy']}`}></div><div>Happy</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md ${colors['sad']}`}></div><div>Sad</div>
                </div>

            </div>
        </div>
    )
}

export default Calendar