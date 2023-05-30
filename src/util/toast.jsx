import toast from "react-hot-toast";

const showToast = ({ icon = <></>, title = "", description = "" }) => {
  toast.custom((t) => (
    <div
      className={`animate-enter max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">{icon}</div>
          <div className="ml-3">
            <p className="text-md font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm break-all text-zinc-500 ">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  ));
};

export default showToast;
