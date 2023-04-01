import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "src/utils/api";

const DiaryCreatePage: NextPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const mutation = api.diary.createDiary.useMutation({
    onSuccess: async (_) => {
      setLoading(false);
      setTitle("");
      setContent("");
      await router.push("/diary");
    },
    onError: (e) => {
      console.error(e);
      setLoading(false);
    },
  });

  return (
    <>
      <Head>
        <title>Create a diary</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center">
        <div className="navbar px-4">
          <Link href="/diary">
            <div className="logo navbar-start cursor-pointer text-3xl font-semibold">
              Diary
            </div>
          </Link>
          <div className="navbar-end">
            <button
              className={`btn-primary btn
              ${loading ? "btn-disabled" : ""}}`}
              onClick={(_) => {
                if (loading) return;
                setLoading(true);
                mutation.mutate({
                  title,
                  content,
                });
              }}
            >
              Save
            </button>
          </div>
        </div>
        <form className="w-full p-2">
          {mutation.error && (
            <div className="text-center text-red-500">
              {mutation.error.message}
            </div>
          )}

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
    </>
  );
};

export default DiaryCreatePage;