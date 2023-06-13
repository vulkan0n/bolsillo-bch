import toast from "react-hot-toast";

const showToast = ({ icon = <></>, title = "", description = "" }) => {
  toast.custom((t) => (
    <div
      className={`opacity-95 animate-enter max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-2`}
      onClick={() => {
        toast.remove(t.id);
      }}
    >
      <div className="flex-shrink-0 my-auto p-2">
        <div className="flex items-center justify-center">{icon}</div>
      </div>
      <div className="p-1">
        <p className="text-lg font-bold text-zinc-800">{title}</p>
        <p className="text-base break-all text-zinc-600">{description}</p>
      </div>
    </div>
  ));
};

export default showToast;
