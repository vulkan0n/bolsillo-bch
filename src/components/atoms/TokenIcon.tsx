import { useState, useEffect } from "react";
import BcmrService from "@/services/BcmrService";
import Checksum from "@/atoms/Checksum";

export default function TokenIcon({
  category,
  size = 64,
}: {
  category: string;
  size?: number;
}) {
  const [isToggled, setIsToggled] = useState(false);
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(
    function resolveIcon() {
      const resolve = async () => {
        const Bcmr = BcmrService();
        const resolvedIcon = await Bcmr.resolveIcon(category);
        setIcon(resolvedIcon);
      };
      resolve();
    },
    [category]
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsToggled(!isToggled);
      }}
    >
      {icon === null || isToggled ? (
        <div
          className="border rounded-sm border-zinc-700 overflow-hidden"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <Checksum data={category} canvasSize={size} />
        </div>
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-full overflow-hidden"
        >
          <img src={icon} />
        </div>
      )}
    </div>
  );
}
