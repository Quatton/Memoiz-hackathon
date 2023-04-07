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
import CommonModal from "src/components/Modal";

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

  const mutationMood = api.mood.addMood.useMutation({
    onSuccess: async (_) => {
      await refetchMood();
      setLoading(false);
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const updateMood = api.mood.updateMood.useMutation({
    onSuccess: async (_) => {
      await refetchMood();
      setLoading(false);
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const [todayMood, setTodayMood] = useState<string>();

  const { data: sessionData, status: sessionStatus } = useSession();

  const { data: diaryData, refetch: refetchDiary } =
    api.diary.getMyDiaries.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined }
    );

  const { data: moodData, refetch: refetchMood } = api.mood.getMoods.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  useEffect(() => {
    if (window !== undefined) {
      if (localStorage.getItem("info") === "false") {
        setIsInfoOpen(false);
      } else {
        setIsInfoOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (moodData !== undefined) {
      setMoods(
        moodData.map((data) => {
          if (dayjs().isSame(dayjs(data.createdAt), "day")) {
            setTodayMood(data.value);
          }
          return {
            date: data.createdAt,
            mood: data.value,
          };
        })
      );
    }
  }, [moodData]);

  const [selectedDay, setSelectedDay] = useState<Date>();
  const [diary, setDiary] = useState<
    { title: string; content: string; id: string }[]
  >([]);

  const [moods, setMoods] = useState<{ date: Date; mood: string }[]>([]);

  const handleSelectMood = (x: string) => {
    const founded = moodData?.find((x) =>
      dayjs().isSame(dayjs(x.createdAt), "day")
    );

    if (founded !== undefined) {
      void updateMood.mutateAsync({ id: founded.id, value: x });
      return;
    }
    void mutationMood.mutateAsync({ value: x });
    return;
  };
  useEffect(() => {
    if (selectedDay && diaryData) {
      setDiary(
        diaryData
          .filter((data) => {
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

  const handleCreateDiary = () => {
    if (loading) return;
    setLoading(true);
    void mutation
      .mutateAsync({
        title: "Untitled",
        content: "",
      })
      .then((x) => {
        void router.push(`/diary/${x.id}`);
        setLoading(false);
      });
  };

  if (sessionStatus === "loading") {
    return <Loading />;
  } else if (sessionStatus === "unauthenticated") {
    return <ToSignIn />;
  }

  return (
    <>
      <Header title="" desc="" />
      <Container>
        <Nav />
        <main className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-5 pb-12">
          <AppName />
          <Mood setMood={handleSelectMood} todayMood={todayMood} />
          <Calendar
            moods={moods}
            onClick={(val) => {
              setSelectedDay(val);
            }}
            selecting={selectedDay}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <h1 className="text-xl">
              {dayjs(selectedDay).format("D MMM YYYY")}
            </h1>
            {diary && diary.length > 0 ? (
              diary.map((currentDiary) => {
                return (
                  <div
                    className="w-full rounded-xl  bg-base-300 p-3 transition-colors hover:cursor-pointer hover:bg-base-200"
                    key={currentDiary.id}
                    onClick={() => {
                      void router.push(`/diary/${currentDiary.id}`);
                    }}
                  >
                    <h1 className="text-lg font-bold text-base-content">
                      {currentDiary.title}
                    </h1>
                    <p className="text-base-content">
                      {currentDiary.content.slice(0, 50)}
                      {currentDiary.content.length > 50 ? "..." : ""}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex h-20 w-full items-center justify-center rounded-xl bg-base-300 p-3">
                <h1 className="flex items-center gap-2 text-error">
                  <IoMdWarning size={22} /> Oops! Diary on{" "}
                  {dayjs(selectedDay).format("D MMM YYYY")} cannot be found.
                </h1>
              </div>
            )}
          </div>
          <div className="flex max-w-md flex-wrap justify-center gap-6">
            <button
              className={`btn-primary btn flex items-center gap-2 ${
                loading ? "loading" : ""
              }`}
              onClick={() => {
                handleCreateDiary();
              }}
            >
              {loading ? "Loading..." : "Write A Diary!"}
              <GiNotebook size={24} />
            </button>
            <Link
              href={"/diary"}
              className="btn-primary btn flex items-center gap-2"
            >
              View all diaries <BsEyeFill size={22} />
            </Link>
            <Link
              href={"/chat"}
              className="btn-primary btn flex items-center gap-2"
            >
              Chat with yourself <BsChatFill size={22} />
            </Link>
          </div>
        </main>
      </Container>

      <CommonModal
        isOpen={isInfoOpen}
        cancel={() => {
          setIsInfoOpen(false);
          localStorage.setItem("info", "false");
        }}
        confirm={() => {
          setIsInfoOpen(false);
        }}
        title="Getting Started"
        description={[
          "Hello there! Welcome to your personal diary. This is a place where you can write down your thoughts and feelings. You can also see your mood and diary history on the calendar.",
          "",
          'To get started, click on the "Write A Diary!" button and start writing your first diary. If you are done, try archiving it by clicking on the "Archive" button. After the diary is archived, Memoiz chat bot will be able to look up your database!',
          "",
          'Try talking with yourself by clicking on the "Chat with yourself".',
          "",
          "Enjoy!",
        ]}
        confirmLabel="Got it!"
        cancelLabel="Do not show again"
      />
    </>
  );
};

export default Home;
