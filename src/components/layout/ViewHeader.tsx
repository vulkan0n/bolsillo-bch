import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface Props {
  icon: React.ComponentType;
  title: string;
}

// NB: Wherever you use this component, 
// Wrap its immediately following elements with "className={pt-14}"
// to compensate for its fixed height
export default function ViewHeader({ icon = () => null, title = "" }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldShowBackButton = location.pathname.split("/").length > 1;

  const Icon = icon;

  return (
    <div className="fixed w-full bg-zinc-900 text-xl text-zinc-200 grid grid-cols-6 py-3 font-bold">
      {shouldShowBackButton ? (
        <button
          type="button"
          className="col-span-1 flex items-center justify-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined className="text-2xl" />
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
