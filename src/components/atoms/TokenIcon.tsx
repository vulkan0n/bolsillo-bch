import { useState, useEffect } from "react";
import BcmrService from "@/services/BcmrService";
import Checksum from "@/atoms/Checksum";

export default function TokenIcon({
  category,
  nft_commitment = undefined,
  size = 64,
  rounded = false,
  returnImage = false,
}: {
  category: string;
  nft_commitment?: string;
  size?: number;
  rounded?: boolean;
  returnImage?: boolean;
}) {
  const [toggleState, setToggleState] = useState(0);
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(
    function resolveIcon() {
      const resolve = async () => {
        const Bcmr = BcmrService();
        const resolvedIcon = await Bcmr.resolveIcon(
          category,
          nft_commitment,
          returnImage
        );
        setIcon(resolvedIcon);
      };
      resolve();
    },
    [category, nft_commitment, returnImage]
  );

  const checksum = nft_commitment ? `${category}${nft_commitment}` : category;

  const handleSetToggle = (event) => {
    event.stopPropagation();

    const toggle =
      icon === null
        ? (toggleState + 1) % (nft_commitment ? 2 : 1)
        : (toggleState + 1) % (nft_commitment ? 3 : 2);

    setToggleState(toggle);
  };

  const categoryColor = `#${category.slice(0, 6)}`;

  // [icon, category+nft_commitment, category]
  const toggleStateRenderables = [
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`${rounded ? "rounded-full" : ""} overflow-hidden`}
    >
      <img src={icon} />
    </div>,
    <div
      className="border-2 border-zinc-600 rounded-sm overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <Checksum data={checksum} canvasSize={size} />
    </div>,
    <div
      className="border-2 rounded-sm overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor: categoryColor,
      }}
    >
      <Checksum data={category} canvasSize={size} />
    </div>,
  ];

  return (
    <div onClick={handleSetToggle}>{toggleStateRenderables[toggleState]}</div>
  );
}
