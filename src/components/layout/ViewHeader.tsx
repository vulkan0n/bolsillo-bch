import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface Props {
  icon: React.ComponentType;
  title: string;
  className?: string;
}

export default function ViewHeader({
  icon = () => null,
  title = "",
  className = "py-3 bg-zinc-900 text-xl text-zinc-200 font-bold",
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldShowBackButton = location.pathname.split("/").length > 1;

  const Icon = icon;

  return (
    <div className={`sticky top-0 z-50 w-full grid grid-cols-6 ${className}`}>
      {shouldShowBackButton ? (
        <button
          type="button"
          className="col-span-1 flex items-center justify-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
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
