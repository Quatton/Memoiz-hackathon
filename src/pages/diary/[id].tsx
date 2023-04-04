import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Loading from "src/components/Loading";
import Nav from "src/components/Nav";
import { api } from "src/utils/api";

const DiaryViewPage: NextPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const {
    data: diaryData,
    isLoading,
    refetch,
  } = api.diary.getDiaryById.useQuery(
    {
      id: router.query.id as string,
    },
    {
      onSuccess(data) {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
      },
    }
  );

  const mutation = api.diary.updateDiary.useMutation();

  // auto-save
  const [payload, setPayload] = useState({
    id: "",
    title: "",
    content: "",
  });
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (diaryData) {
      // check if title & content is the same as last payload
      if (title === payload.title && content === payload.content) return;

      const autoSaveInterval = setInterval(() => {
        if (title === diaryData.title && content === diaryData.content) return;
        void mutation
          .mutateAsync({
            id: router.query.id as string,
            title,
            content,
          })
          .then((_) => {
            setUpdatedAt(new Date());
            setPayload({
              id: router.query.id as string,
              title,
              content,
            });
          });
      }, 5000);

      return () => {
        clearInterval(autoSaveInterval);
      };
    }
  }, [
    title,
    content,
    mutation,
    router.query.id,
    diaryData,
    payload.title,
    payload.content,
  ]);

  if (isLoading) {
    return <Loading />
  }

  return (
    <Container>
      <Header title="Create a diary" desc="" />
      <main className="flex w-full min-h-screen flex-col items-center">
        <Nav breads={[{ title: 'Home', path: '' }, { title: 'Diary', path: '/diary' }, { title: 'Create a diary', path: '/diary/create' }]} />
        <form className="w-full p-2">
          {mutation.error && (
            <div className="text-center text-red-500">
              {mutation.error.message}
            </div>
          )}

          <div className="text-center text-gray-500">
            {updatedAt && `Last updated at ${updatedAt.toLocaleString()}`}
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              placeholder="Title"
              className="input-bordered input-primary input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Content</span>
            </label>
            <textarea
              placeholder="Content"
              className="textarea-bordered textarea-primary textarea h-24 resize-none"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            ></textarea>
          </div>
        </form>
      </main>
    </Container>
  );
};

export default DiaryViewPage;
