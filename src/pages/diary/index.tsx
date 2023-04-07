import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Container from "src/components/Container";
import Nav from "src/components/Nav";
import { BsArchiveFill, BsArchive } from "react-icons/bs";
import { RiFileAddFill } from 'react-icons/ri'
import { api } from "src/utils/api";
import dayjs from "dayjs";

const DiaryPage: NextPage = () => {
  const { data: sessionData } = useSession();
  const { data: diaryData, refetch: refetchDiary } =
    api.diary.getMyDiaries.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined }
    );
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const mutation = api.diary.createDiary.useMutation({
    onSuccess: async (_) => {
      await refetchDiary();


    },
    onError: (e) => {
      console.error(e);
    },
  });

  return (
    <Container>
      <Head>
        <title>Diary</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav
      />
      <main className="flex w-full flex-col items-center">
        <div className="w-full max-w-4xl px-5 overflow-x-auto">
          <table className="table-compact table w-full shadow-md ">
            <thead className="">
              <tr>
                <th></th>
                <th>Date</th>
                <th>Title</th>
                <th className="">
                </th>
              </tr>
            </thead>
            <tbody >
              {diaryData ? <></> : <tr
                className="hover cursor-pointer animate-pulse"
              >
                <th className="">
                  Loading...
                </th>
                <td className="">
                  Loading...
                </td>
                <td className="">Loading...</td>
                <td className=" truncate">Loading...</td>
              </tr>}
              {diaryData?.sort((x, y) => +(new Date(y.createdAt)) - +(new Date(x.createdAt)))?.map((diary) => (
                <tr
                  key={diary.id}
                  className="hover cursor-pointer "
                  onClick={() => {
                    if (loading) return;
                    setLoading(true);
                    void router.push(`/diary/${diary.id}`);
                  }}
                >
                  <th className="">
                    {diary.isArchived ? <BsArchiveFill className="text-primary ml-2" /> : <BsArchive className="ml-2" />}
                  </th>
                  <td className="">
                    {dayjs(diary.createdAt).format('D MMM YYYY')}
                  </td>
                  <td className="">{diary.title}</td>
                  <td className="truncate">{diary.content.length > 20 ? `${diary.content.slice(0, 20)}...` : diary.content}</td>
                </tr>
              ))}

            </tbody>
          </table>
          <div className="w-full flex py-3">
            <button
              className={`btn-primary ml-auto btn ${loading ? 'loading' : ''}`}
              onClick={() => {
                if (loading) return;
                setLoading(true);
                void mutation.mutateAsync({
                  title: "Untitled",
                  content: "",
                }).then((x) => {
                  void router.push(`/diary/${x.id}`);
                  setLoading(false);
                });
              }}
            >
              {loading ? "Loading..." : <><RiFileAddFill size={20} className="mr-2" /> New</>}
            </button>
          </div>
        </div>
      </main>
    </Container>
  );
};

export default DiaryPage;
