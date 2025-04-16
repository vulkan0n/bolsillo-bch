import ReactPlayer from "react-player/youtube";

interface Props {
  url: string;
}

export default function EmbeddedVideo({ url }: Props) {
  return (
    <div className="w-full flex justify-center">
      <ReactPlayer url={url} width="100%" />
    </div>
  );
}

function EmbeddedVideoCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden">{children}</div>
  );
}

export function EmbeddedVideoCard({ url }: Props) {
  return (
    <ReactPlayer url={url} width="100%" wrapper={EmbeddedVideoCardWrapper} />
  );
}
