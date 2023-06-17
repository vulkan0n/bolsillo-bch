import { useState } from "react";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";

export default function SettingsCategory({ icon, title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = icon;

  return (
    <div
      tabIndex={0}
      className="bg-zinc-800 rounded-lg p-2 my-1 text-zinc-200 p-2 my-1"
    >
      <div
        className="text-lg font-medium p-1 flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-1 flex items-center">
          <Icon className="text-xl text-primary mr-1.5" />
          <span>{title}</span>
        </span>
        {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </div>
      {isOpen && (
        <div className="mt-1 text-zinc-700 rounded-sm bg-zinc-200 divide-y divide-zinc-300">
          {children}
        </div>
      )}
    </div>
  );
}
