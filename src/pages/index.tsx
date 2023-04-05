import { type NextPage } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { api } from "src/utils/api";
import Calendar from "src/components/calendar";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { useRouter } from "next/router";
import Loading from "src/components/Loading";
import ToSignIn from "src/components/ToSignIn";
import Header from "src/components/Header";
import Container from "src/components/Container";
import { BsChatFill, BsEyeFill } from "react-icons/bs";
import { GiNotebook } from "react-icons/gi";
import { IoMdWarning } from "react-icons/io";
import Nav from "src/components/Nav";
import Mood from "src/components/Mood";
import AppName from "src/components/AppName";

const Home: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const mutation = api.diary.createDiary.useMutation({
    onSuccess: async (_) => {
      await refetchDiary();
      setLoading(false);
    },
    onError: (e) => {
      console.error(e);
    },
  });


  const { data: sessionData, status: sessionStatus } = useSession();

  const { data: diaryData, refetch: refetchDiary } =
    api.diary.getMyDiaries.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined }
    );

  const [selectedDay, setSelectedDay] = useState<Date>();
  const [diary, setDiary] = useState<
    { title: string; content: string; id: string }[]
  >([]);
  const [moods, setMoods] = useState<{ [key: string]: "happy" | "sad" }>({
    "2023/04/02": "happy",
    "2023/04/01": "sad",
  });
  useEffect(() => {
    if (selectedDay && diaryData) {
      setDiary(
        diaryData
          .filter((data) => {
            console.log(dayjs(selectedDay));
            console.log(dayjs(data.createdAt));
            console.log(
              dayjs(selectedDay).isSame(dayjs(data.createdAt), "day")
            );
            return dayjs(selectedDay).isSame(dayjs(data.createdAt), "day");
          })
          .map((data) => {
            return {
              title: data.title,
              content: data.content,
              id: data.id,
            };
          })
      );
    }
  }, [selectedDay, diaryData]);

  useEffect(() => {
    console.log(diaryData);
  }, [diaryData]);


  const handleCreateDiary = () => {
    if (loading) return;
    setLoading(true);
    void mutation.mutateAsync({
      title: "Untitled",
      content: "",
    }).then((x) => {
      void router.push(`/diary/${x.id}`)
      setLoading(false)
    });
  }


  if (sessionStatus === "loading") {
    return <Loading />;
  } else if (sessionStatus === "unauthenticated") {
    return <ToSignIn />;
  }
  const setMood = (x: "happy" | "sad") => {
    setMoods((temp) => {
      temp[dayjs().format("YYYY/MM/DD")] = x;
      return temp;
    });
    return;
  };


  return (
    <>
      <Header title="" desc="" />
      <Container>
        <Nav breads={[]} />
        <main className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6">
          <AppName />
          <Mood setMood={setMood} />
          <Calendar
            moods={moods}
            onClick={(val) => {
              setSelectedDay(val);
            }}
            selecting={selectedDay}
          />

          <div className="flex flex-col justify-center items-center gap-3">
            {dayjs(selectedDay).format("D MMM YYYY")}
            {diary && diary.length > 0 ? (
              diary.map((currentDiary, idx) => {
                return (
                  <div
                    className="w-72 rounded-xl  bg-white p-3 transition-colors hover:cursor-pointer hover:bg-gray-200 md:w-96"
                    key={currentDiary.id}
                    onClick={() => {
                      void router.push(`/diary/${currentDiary.id}`);
                    }}
                  >
                    <h1 className="font-bold text-lg text-accent">
                      {currentDiary.title}
                    </h1>
                    <p className="text-base-content">{currentDiary.content.slice(0, 50)}{currentDiary.content.length > 50 ? '...' : ''}</p>
                  </div>
                );
              })
            ) : (
              <div className="flex h-20 w-72 items-center justify-center rounded-xl bg-white p-3 md:w-96">
                <h1 className="flex items-center gap-2 text-error">
                  <IoMdWarning size={22} /> Oops! No diary on{" "}
                  {dayjs(selectedDay).format("D MMM YYYY")}
                </h1>
              </div>
            )}
          </div>
          <div className="flex gap-6">
            <button
              className={`btn-primary btn flex items-center gap-2 ${loading ? 'loading' : ''}`}
              onClick={() => { handleCreateDiary() }}
            >
              {loading ? 'Loading...' : 'Write A Diary!'}<GiNotebook size={24} />
            </button>
            <Link
              href={"/diary"}
              className="btn-primary btn flex items-center gap-2"
            >
              View all diaries <BsEyeFill size={22} />
            </Link>
          </div>
          <Link
            href={"/chat"}
            className="btn-primary btn flex items-center gap-2"
          >
            Chat with yourself <BsChatFill size={22} />
          </Link>
        </main>
      </Container>
    </>
  );
};

export default Home;
