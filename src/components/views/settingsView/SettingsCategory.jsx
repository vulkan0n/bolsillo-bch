import { useState } from "react";

export default function SettingsCategory({ icon, title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = icon;

  return (
    <div
      tabIndex={0}
      className="bg-zinc-800 rounded-lg p-2 my-1 collapse collapse-arrow text-zinc-200 p-2 my-1"
    >
      <input
        type="checkbox"
        checked={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <div className="collapse-title text-lg font-medium p-1">
        <Icon className="text-xl text-primary" /> {title}
      </div>
      <div className="collapse-content">
        {isOpen && (
          <div className="mt-1 text-zinc-700 rounded-sm bg-zinc-200 divide-y divide-zinc-300">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
