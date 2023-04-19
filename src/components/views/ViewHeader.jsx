import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default function ViewHeader({ icon, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname.split("/").length > 2;

  const Icon = icon;

  return (
    <div className="bg-zinc-900 text-xl text-zinc-200 p-3 font-bold">
      <div className="flex items-center">
        {showBackButton && (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined className="text-2xl" />
          </div>
        )}
        <div className="text-center w-full">
          <Icon className="text-2xl" />
          &nbsp;{title}
        </div>
      </div>
    </div>
  );
}
