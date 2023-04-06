import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { BsArchive, BsArchiveFill } from "react-icons/bs";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Loading from "src/components/Loading";
import Nav from "src/components/Nav";
import { api } from "src/utils/api";

const DiaryViewPage: NextPage = () => {
  const router = useRouter();

  const { data, isLoading, refetch } = api.diary.getDiaryById.useQuery(
    {
      id: (router.query.id as string) || "",
    },
    {
      onSuccess(data) {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setPayload({
            title: data.title,
            content: data.content,
          });
          return;
        }

        void router.push("/diary");
      },

      onError() {
        void router.push("/diary");
      },
    }
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const updateDiary = api.diary.updateDiary.useMutation({});

  // auto-save
  const [payload, setPayload] = useState({
    title: "",
    content: "",
  });

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const save = useCallback(async () => {
    // if empty, do not save
    if (title === "" || content === "") return;

    if (title === payload.title && content === payload.content) return;

    const id = router.query.id as string;
    await updateDiary.mutateAsync(
      {
        id,
        title: title,
        content: content,
      },

      {
        onSuccess: (data) => {
          setPayload({
            title: data.title,
            content: data.content,
          });
          setUpdatedAt(data.updatedAt);
        },
      }
    );
  }, [title, content, payload, updateDiary, router.query.id]);

  useEffect(() => {
    if (router.query.id) {
      const timer = setTimeout(() => {
        void save();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    title,
    content,
    router.query.id,
    payload.title,
    payload.content,
    updateDiary,
    save,
  ]);

  // time left before archive
  const [timeLeft, setTimeLeft] = useState({
    hour: "00",
    minute: "00",
    second: "00",
  });

  // you can manually archive for now
  // useEffect(() => {
  //   if (!data) return;

  //   if (data.isArchived || !data.createdAt) return;

  //   const timer = setInterval(() => {
  //     const createdAt = new Date(data.createdAt);

  //     // will archive in the next 24 hr
  //     const archiveAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  //     const now = new Date();

  //     const diff = archiveAt.getTime() - now.getTime();

  //     const hour = Math.floor(diff / (1000 * 60 * 60))
  //       .toString()
  //       .padStart(2, "0");
  //     const minute = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  //       .toString()
  //       .padStart(2, "0");
  //     const second = Math.floor((diff % (1000 * 60)) / 1000)
  //       .toString()
  //       .padStart(2, "0");

  //     setTimeLeft({
  //       hour,
  //       minute,
  //       second,
  //     });
  //   }, 1000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [data]);

  const archive = api.diary.archiveDiary.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <Container>
      <Header title="Create a diary" desc="" />
      <main className="flex min-h-screen w-full flex-col items-center">
        <Nav
          breads={[
            { title: "Home", path: "/" },
            { title: "Diary", path: "/diary" },
            { title: "Write a diary", path: "/diary/create" },
          ]}
        />
        <form className="mx-auto flex w-full max-w-4xl flex-col gap-2 p-4">
          <div className="flex w-full items-center rounded-md bg-base-300 p-4 shadow-md">
            {!data?.isArchived ? (
              <button
                className="btn-primary btn-sm btn"
                onClick={() => {
                  if (archive.isLoading) return;
                  void save().then(async () => {
                    await archive.mutateAsync({
                      id: data.id,
                    });
                  })
                }}
              >
                <BsArchive />
                <span className="ml-2">Archive</span>
              </button>
            ) : (
              <button className="btn-disabled btn-sm btn">
                <BsArchiveFill />
                <span className="ml-2">Archived</span>
              </button>
            )}

            {!data.isArchived ? (
              <button
                className="btn-accent btn-sm btn ml-auto"
                onClick={() => {
                  void save();
                }}
              >
                Save
              </button>
            ) : (
              <button className="btn-disabled btn-sm btn ml-auto">Save</button>
            )}
          </div>

          {updateDiary.error && (
            <div className="text-center text-red-500">
              {updateDiary.error.message}
            </div>
          )}

          <div className="text-center text-gray-500">
            {`Last updated at ${
              (updatedAt
                ? updatedAt.toLocaleString()
                : data?.updatedAt.toLocaleString()) || ""
            }`}
          </div>

          <div className="form-control">
            <input
              type="text"
              placeholder="Title"
              className="input-ghost input text-4xl font-semibold"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              readOnly={data.isArchived}
            />
          </div>
          <div className="form-control">
            <textarea
              placeholder="Type something here..."
              cols={30}
              className="textarea-bordered textarea h-96 resize-none"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              readOnly={data.isArchived}
            ></textarea>
          </div>
        </form>
      </main>
    </Container>
  );
};

export default DiaryViewPage;
