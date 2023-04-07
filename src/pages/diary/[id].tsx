import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { BsArchive, BsArchiveFill } from "react-icons/bs";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Loading from "src/components/Loading";
import Nav from "src/components/Nav";
import { api } from "src/utils/api";
import { FaSave } from "react-icons/fa";
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
  const [submit, setSubmit] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const updateDiary = api.diary.updateDiary.useMutation({});

  // auto-save
  const [payload, setPayload] = useState({
    title: "",
    content: "",
  });

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const save = useCallback(async () => {
    // if empty, do not save
    if (title === "" || content === "") {
      setSubmit(false);
      return;
    }

    if (title === payload.title && content === payload.content) {
      setSubmit(false);
      return;
    }

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
          setSubmit(false)
          setUpdatedAt(data.updatedAt);
        },
      }
    );
  }, [title, content, payload, updateDiary, router.query.id]);

  useEffect(() => {
    if (router.query.id) {
      const timer = setTimeout(() => {
        void save();
      }, 500);

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
      <main className="flex w-full flex-col items-center px-5">
        <Nav />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 p-4">
          {updateDiary.error && (
            <div className="text-center text-red-500">
              {updateDiary.error.message}
            </div>
          )}

          <div className="text-center text-gray-500">
            {`Last updated at ${(updatedAt
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
              disabled={data.isArchived}
              placeholder="Type something here..."
              cols={30}
              className="textarea-bordered textarea h-96 resize-none bg-base-300"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              readOnly={data.isArchived}
            ></textarea>
          </div>
          <div className="ml-auto">
            {`${content
              .replace(/[^\w]/g, " ")
              .split(" ")
              .filter((x) => x != "").length
              } word${content
                .replace(/[^\w]/g, " ")
                .split(" ")
                .filter((x) => x != "").length > 1
                ? "s"
                : ""
              }`}
          </div>
          <div className="flex w-full items-center justify-end gap-3 rounded-md">
            {data ? (
              <button
                type="button"
                className={`btn ${!data.isArchived ? "btn-accent" : "btn-disabled"
                  } ${isArchiving ? "loading" : ""}`}
                onClick={() => {
                  if (archive.isLoading) return;
                  setIsArchiving(true);
                  void save().then(async () => {
                    await archive.mutateAsync({
                      id: data.id,
                    });
                  });
                }}
              >
                {isArchiving ? (
                  <></>
                ) : !data.isArchived ? (
                  <BsArchive size={20} />
                ) : (
                  <BsArchiveFill size={20} />
                )}
                <span className="ml-2">
                  {isArchiving
                    ? "Archiving..."
                    : !data.isArchived
                      ? "Archive"
                      : "Archived"}
                </span>
              </button>
            ) : (
              <></>
            )}

            <button
              type="button"
              className={`${submit ? "loading" : ""} ${!data.isArchived ? "btn-accent" : "btn-disabled"
                } btn flex gap-3`}
              onClick={() => {
                if (!data.isArchived) {
                  setSubmit(true);
                  void save();
                }
              }}
            >
              {submit ? (
                "Saving..."
              ) : (
                <>
                  <FaSave size={20} />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </Container>
  );
};

export default DiaryViewPage;
