import { LinkOutlined } from "@ant-design/icons";

function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary flex items-center gap-2 w-full py-3 px-6 border-b border-[#ececec] last:border-b-0"
    >
      <LinkOutlined /> <span className="flex-1">{label}</span> <span>→</span>
    </a>
  );
}

export default LinkItem