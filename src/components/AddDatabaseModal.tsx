import { Dialog, Transition } from "@headlessui/react";
import { isFullDatabase } from "@notionhq/client";
import { Fragment, useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useNotionDatabaseStore } from "src/utils/stores/notionDatabaseStore";
import { api } from "src/utils/api";

export const AddDatabaseModal: React.FC = () => {
  const { isOpen, setIsOpen, setShownDatabaseId } = useNotionDatabaseStore();

  const close = () => {
    setIsOpen(false);
  };

  const [searchQueryInput, setSearchQueryInput] = useState("");
  const payload = useDebounce(searchQueryInput, 500);

  const { data: searchResult } = api.notion.searchDatabases.useQuery(
    {
      query: payload,
    },
    {
      enabled: payload.length > 0 && isOpen,
      staleTime: 500,
    }
  );
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setSearchQueryInput("");
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-300 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                  Add a new database
                </Dialog.Title>

                <Dialog.Description className="mt-2 text-sm">
                  <div>
                    <input
                      type="text"
                      placeholder="Search"
                      className="input-bordered input input-sm w-full"
                      value={searchQueryInput}
                      onChange={(e) => setSearchQueryInput(e.target.value)}
                    />
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-base-200">
                    {searchResult?.results.map((result) => {
                      if (
                        result.object === "database" &&
                        isFullDatabase(result)
                      ) {
                        return (
                          <div
                            key={result.id}
                            className="flex items-center justify-between border-b border-base-300 p-2"
                          >
                            <div className="flex items-center gap-2">
                              <MdSearch className="text-base-300" />
                              <span>{result.title[0]?.plain_text}</span>
                            </div>
                            <button
                              className="btn-accent btn-sm btn"
                              onClick={() => {
                                setShownDatabaseId(result.id);
                                close();
                              }}
                            >
                              View
                            </button>
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                </Dialog.Description>

                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" className="btn" onClick={close}>
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

/**
 * Helper hook to debounce input
 * Usage:
 *
 * ```ts
 * const [searchQueryInput, setSearchQueryInput] = useState("");
 * const debouncedSearchQueryInput = useDebounce(searchQueryInput, 500);
 *
 * // debouncedSearchQueryInput will be debounced on searchQueryInput by 500ms
 * */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
