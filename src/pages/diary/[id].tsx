import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { BsArchive, BsArchiveFill } from "react-icons/bs";
import Container from "src/components/Container";
import Header from "src/components/Header";
import Loading from "src/components/Loading";
import Nav from "src/components/Nav";
import { api } from "src/utils/api";
import { MdDeleteForever } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import CommonModal from "src/components/Modal";
import { type TRPCError } from "@trpc/server";

const DiaryViewPage: NextPage<{ id: string }> = ({ id }) => {
  const router = useRouter();

  const { data, isLoading, refetch } = api.diary.getDiaryById.useQuery(
    {
      id: id,
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

  const updateDiary = api.diary.updateDiary.useMutation({});
  const deleteDiary = api.diary.deleteDiary.useMutation({
    onSuccess: () => {
      void router.replace("/diary");
    },
  });

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);

  const unarchive = api.diary.unarchiveDiary.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const allowUnarchive =
    data &&
    data.isArchived &&
    Date.now() - new Date(data.updatedAt).getTime() > 24 * 60 * 60 * 1000;

  const archive = api.diary.archiveDiary.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  // auto-save
  const [payload, setPayload] = useState({
    title: "",
    content: "",
  });

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const save = useCallback(async () => {
    if (
      updateDiary.isLoading ||
      archive.isLoading ||
      unarchive.isLoading ||
      !data ||
      data.isArchived
    )
      return;
    // if empty, do not save
    if (title === "" || content === "") {
      setSubmit(false);
      return;
    }

    if (title === payload.title && content === payload.content) {
      setSubmit(false);
      return;
    }

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
          setSubmit(false);
          setUpdatedAt(data.updatedAt);
        },
      }
    );
  }, [
    updateDiary,
    archive.isLoading,
    unarchive.isLoading,
    data,
    title,
    content,
    payload.title,
    payload.content,
    id,
  ]);

  const saveAndArchive = useCallback(async () => {
    if (
      updateDiary.isLoading ||
      archive.isLoading ||
      unarchive.isLoading ||
      !data ||
      data.isArchived
    )
      return;

    if (title === "" || content === "") return;
    await archive.mutateAsync({
      id: data.id,
      title: title,
      content: content,
    });
  }, [
    archive,
    content,
    data,
    title,
    unarchive.isLoading,
    updateDiary.isLoading,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void save();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [title, content, payload.title, payload.content, updateDiary, save]);

  // time left before archive
  // const [timeLeft, setTimeLeft] = useState({
  //   hour: "00",
  //   minute: "00",
  //   second: "00",
  // });

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

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    void router.replace("/404");
    return <Loading />;
  }

  return (
    <Container>
      <Header title="Create a diary" desc="" />
      <main className="flex w-full flex-col items-center px-5">
        <Nav />

        <form className="mx-auto flex w-full max-w-4xl flex-col gap-2 p-4">
          <div className="text-center text-gray-500">
            <span className="text-gray-500">
              {`Last updated at ${
                Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(updatedAt ? updatedAt : data?.updatedAt) || ""
              }`}
            </span>

            {updateDiary.error && (
              <span className="ml-2 text-center text-red-500">
                {(JSON.parse(updateDiary.error.message) as Array<TRPCError>)
                  ? (
                      JSON.parse(updateDiary.error.message) as Array<TRPCError>
                    )[0]?.message
                  : "Something went wrong"}
              </span>
            )}
          </div>

          <div className="form-control">
            <input
              type="text"
              placeholder="Title"
              className="input-ghost input pr-16 text-4xl font-semibold"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              readOnly={data.isArchived}
            />
            <label
              className={`label ml-auto ${
                title.length > 60 ? "text-error" : ""
              }`}
            >
              {title.length}/60
            </label>
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

            <label
              className={`label ml-auto ${
                content.length > 500 ? "text-error" : ""
              }`}
            >
              {
                // `${
                //   content
                //     .replace(/[^\w]/g, " ")
                //     .split(" ")
                //     .filter((x) => x != "").length
                // } word${
                //   content
                //     .replace(/[^\w]/g, " ")
                //     .split(" ")
                //     .filter((x) => x != "").length > 1
                //     ? "s"
                //     : ""
                // }`
                content.length
              }
              /500
            </label>
          </div>

          <div className="flex w-full items-center justify-end gap-3 rounded-md">
            <button
              className="btn-error btn mr-auto"
              onClick={(e) => {
                e.preventDefault();
                setIsDeleteModalOpen(true);
              }}
            >
              {!deleteDiary.isLoading && <MdDeleteForever size={20} />}
              <span className="ml-2">
                {deleteDiary.isLoading ? "Deleting..." : "Delete"}
              </span>
            </button>
            <button
              className={`btn ${
                !data.isArchived || allowUnarchive
                  ? "btn-accent"
                  : "btn-disabled"
              } ${archive.isLoading ? "loading" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                if (!data.isArchived) setIsArchiveModalOpen(true);
                if (allowUnarchive) setIsUnarchiveModalOpen(true);
              }}
            >
              {archive.isLoading ? (
                <></>
              ) : !data.isArchived ? (
                <BsArchive size={20} />
              ) : (
                <BsArchiveFill size={20} />
              )}
              <span className="ml-2">
                {archive.isLoading
                  ? "Archiving..."
                  : !data.isArchived
                  ? "Archive"
                  : "Unarchive"}
              </span>
            </button>
            <button
              className={`${submit ? "loading" : ""} ${
                !data.isArchived ? "btn-accent" : "btn-disabled"
              } btn flex gap-3`}
              onClick={(e) => {
                e.preventDefault();
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
        </form>
      </main>

      <CommonModal
        isOpen={isUnarchiveModalOpen}
        cancel={() => setIsUnarchiveModalOpen(false)}
        confirm={() => {
          setIsUnarchiveModalOpen(false);
          unarchive.mutate({
            id: data.id,
          });
        }}
        title="Confirm Unarchive"
        description="This document will be unarchived. You will be able to edit this document again, but Memoiz will forget this piece of information. Are you sure?"
        confirmLabel="Unarchive"
      />

      <CommonModal
        isOpen={isDeleteModalOpen}
        cancel={() => setIsDeleteModalOpen(false)}
        confirm={() => {
          setIsDeleteModalOpen(false);
          deleteDiary.mutate({
            id: data.id,
          });
        }}
        title="Confirm Deletion"
        description="This action cannot be undone"
        confirmLabel="Delete"
      />

      <CommonModal
        isOpen={isArchiveModalOpen}
        cancel={() => setIsArchiveModalOpen(false)}
        confirm={() => {
          setIsArchiveModalOpen(false);
          void saveAndArchive();
        }}
        title="Confirm Archiving"
        description="This document will be archived in Memoiz's long-term memory. You will not be able to edit this document. Are you sure?"
        confirmLabel="Archive"
      />
    </Container>
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  if (!id)
    return {
      notFound: true,
    };

  return {
    props: {
      id,
    },
  };
};

export default DiaryViewPage;
