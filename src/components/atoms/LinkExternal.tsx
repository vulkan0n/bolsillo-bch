import { useNavigateExternal } from "@/hooks/useNavigateExternal";

export default function LinkExternal({
  to,
  children,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const navigateExternal = useNavigateExternal();

  const handleClick = (e) => {
    e.stopPropagation();
    navigateExternal(to);
  };

  return (
    <div onClick={handleClick} className={`${className} cursor-pointer`}>
      {children}
    </div>
  );
}
