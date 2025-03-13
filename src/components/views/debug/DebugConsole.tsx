import { useState, useEffect } from "react";
import ConsoleService from "@/services/ConsoleService";

export default function DebugConsole() {
  const consoleLines = ConsoleService().getLines();
  const [renderKey, setRenderKey] = useState(consoleLines.length);

  useEffect(function reloadConsoleLines() {
    const interval = setInterval(() => {
      const lines = ConsoleService().getLines();
      setRenderKey(lines.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono h-[50vh] overflow-y-auto border border-black rounded text-wrap break-words">
      <ul className="h-full text-sm" key={renderKey}>
        {consoleLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
