import { useSelector } from "react-redux";
import { Browser } from "@capacitor/browser";
import PlayCircleFilled from "@ant-design/icons/PlayCircleFilled";

import { selectDevicePlatform } from "@/redux/device";

// --------------------------------

/** Extract YouTube video ID from various URL formats. */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  let result: string | null = null;
  patterns.forEach((pattern) => {
    if (!result) {
      const match = url.match(pattern);
      if (match) result = match[1];
    }
  });
  return result;
}

function openVideo(url: string, platform: string) {
  if (platform === "web") {
    window.open(url, "_blank");
  } else {
    Browser.open({ url });
  }
}

// --------------------------------

interface Props {
  url: string;
}

function VideoThumbnail({ url }: Props) {
  const platform = useSelector(selectDevicePlatform);
  const videoId = getYouTubeId(url);
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  if (!thumbnail) return null;

  return (
    <button
      type="button"
      className="relative w-full aspect-video bg-black cursor-pointer group"
      onClick={() => openVideo(url, platform)}
    >
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <PlayCircleFilled
          className="text-white drop-shadow-lg"
          style={{ fontSize: 64 }}
        />
      </div>
    </button>
  );
}

// --------------------------------

export default function EmbeddedVideo({ url }: Props) {
  return (
    <div className="w-full flex justify-center">
      <VideoThumbnail url={url} />
    </div>
  );
}

export function EmbeddedVideoCard({ url }: Props) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <VideoThumbnail url={url} />
    </div>
  );
}
