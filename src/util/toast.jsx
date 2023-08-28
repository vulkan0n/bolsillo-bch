import toast from "react-hot-toast";

const showToast = ({ icon = null, title = "", description = "", options }) => {
  toast.custom(
    (t) => (
      <div
        className="relative opacity-95 w-full bg-white shadow-lg rounded-lg flex ring-1 ring-black ring-opacity-5 p-2"
        onClick={() => {
          toast.remove(t.id);
        }}
      >
        <div className="my-auto p-2">
          <div className="flex items-center justify-center">{icon}</div>
        </div>
        <div className="p-1 break-word">
          <div className="text-lg font-bold text-zinc-800">{title}</div>
          <div className="text-base text-zinc-600">{description}</div>
        </div>
      </div>
    ),
    options
  );
};

export default showToast;
