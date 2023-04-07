import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { colors, allMoods } from "./Mood";

type Dayjs = dayjs.Dayjs;
const Calendar = ({
  onClick,
  moods,
}: {
  onClick: (day: Date) => void;
  moods: { date: Date; mood: string }[];
  selecting: Date | undefined;
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
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-72 rounded-xl bg-primary-content p-3 md:w-96 md:p-6 ">
        <div className="flex items-center justify-between">
          <MdKeyboardArrowLeft
            className="text-secondary hover:cursor-pointer hover:text-secondary-focus"
            size={25}
            onClick={() => setSelectedDate((date) => date.subtract(1, "month"))}
          />
          <h3 className="text-lg font-bold text-primary">
            {selectedDate.clone().format("MMM YYYY")}
          </h3>
          <MdKeyboardArrowRight
            className="text-secondary hover:cursor-pointer hover:text-secondary-focus"
            size={25}
            onClick={() => setSelectedDate((date) => date.add(1, "month"))}
          />
        </div>
        <div className="flex justify-between font-semibold">
          {generateWeeksOfTheMonth[0] &&
            generateWeeksOfTheMonth[0].map((day, index) => (
              <div
                key={`week-day-${index}`}
                className="flex h-8 w-8 items-center justify-center text-info"
              >
                {dayjs(day).format("dd")}
              </div>
            ))}
        </div>
        {generateWeeksOfTheMonth.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="flex justify-between">
            {week.map((day, dayIndex) => {
              let bgColor = "";
              const isSameMonth =
                selectedDate.clone().toDate().getMonth() !== day.getMonth();

              const isToday = dayjs(currentDay).isSame(day, "date");
              const founded = moods.find((x) =>
                dayjs(x.date).isSame(day, "date")
              );
              if (founded) {
                allMoods.forEach((mood) => {
                  if (mood == founded.mood) {
                    bgColor = colors[mood];
                  }
                });
              }

              return (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-center transition-colors
                                     hover:cursor-pointer hover:bg-primary-focus 
                                    ${
                                      isSameMonth
                                        ? "text-gray-200 hover:text-white"
                                        : isToday
                                        ? "text-red-500 hover:text-red-400"
                                        : "text-gray-500 hover:text-white"
                                    }
                                    ${bgColor}
                                    `}
                  key={`day-${dayIndex}`}
                  onClick={() => {
                    onClick(day);
                  }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex w-72 flex-wrap gap-3 md:w-96">
        {allMoods.map((mood) => {
          return (
            <div className="flex items-center gap-2" key={mood}>
              <div className={`h-4 w-4 rounded-md ${colors[mood]}`}></div>
              <div className="capitalize">{mood}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
