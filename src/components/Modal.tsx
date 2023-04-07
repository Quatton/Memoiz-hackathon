import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  isOpen: boolean;
  cancel: () => void;
  confirm: () => void;

  title: string;
  description: string | string[];
  confirmLabel: string;
  cancelLabel: string;
};

export default function CommonModal({
  isOpen,
  cancel,
  confirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: Props) {
  const descriptionList = Array.isArray(description)
    ? description
    : [description];

  return (
    <>
      {/* <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={cancel}
          className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Open dialog
        </button>
      </div> */}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={confirm}>
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2 text-sm">
                    {descriptionList.map((description, idx) =>
                      description.length > 0 ? (
                        <p key={idx}>{description}</p>
                      ) : (
                        <br key={idx} />
                      )
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" className="btn" onClick={cancel}>
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      className="btn-accent btn"
                      onClick={confirm}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
