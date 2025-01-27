import { useEffect, useRef } from "react";
import { sha256 } from "@/util/hash";

interface ChecksumProps {
  data: string;
  size?: number;
}

export default function Checksum({ data, size = 1 }: ChecksumProps) {
  const canvasRef = useRef(null);

  const PIXEL_SIZE = 4 * size;
  const GRID_SIZE = 4;
  const CANVAS_SIZE = PIXEL_SIZE * GRID_SIZE * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const hash = sha256.text(data);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate image from hash for one quadrant and mirror it
    for (let i = 0; i < 64; i += 2) {
      const x = (i / 2) % GRID_SIZE;
      const y = Math.floor(i / (GRID_SIZE * 2));

      // Extract RGB values from hash
      const r = parseInt(hash.slice(i, i + 2), 16);
      const g = parseInt(hash.slice((i + 2) % 64, (i + 4) % 64), 16);
      const b = parseInt(hash.slice((i + 4) % 64, (i + 6) % 64), 16);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Draw in all four quadrants
      for (let quadrantX = 0; quadrantX < 2; quadrantX += 1) {
        for (let quadrantY = 0; quadrantY < 2; quadrantY += 1) {
          const mirrorX = quadrantX ? GRID_SIZE - 1 - x : x;
          const mirrorY = quadrantY ? GRID_SIZE - 1 - y : y;

          ctx.fillRect(
            mirrorX * PIXEL_SIZE + quadrantX * GRID_SIZE * PIXEL_SIZE,
            mirrorY * PIXEL_SIZE + quadrantY * GRID_SIZE * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }

    // Draw outline
    ctx.strokeStyle = "#444"; // Black outline
    ctx.lineWidth = 1 * size; // Adjust thickness as needed
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, [data, size, PIXEL_SIZE, CANVAS_SIZE]);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
}
