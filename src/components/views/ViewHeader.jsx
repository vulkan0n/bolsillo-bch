import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function ViewHeader({ icon, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname.split("/").length > 1;

  const Icon = icon;

  return (
    <div className="bg-zinc-900 text-xl text-zinc-200 grid grid-cols-6 py-3 font-bold">
      {showBackButton ? (
        <div
          className="col-span-1 flex items-center justify-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined className="text-2xl" />
        </div>
      ) : (
        <div className="col-span-1">&nbsp;</div>
      )}
      <div className="text-center col-span-4 flex items-center justify-center">
        <Icon className="text-2xl mr-2" />
        {title}
      </div>
      <div className="col-span-1">&nbsp;</div>
    </div>
  );
}
