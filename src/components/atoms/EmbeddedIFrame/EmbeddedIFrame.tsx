import ReactPlayer from 'react-player/youtube'

interface Props {
  src: string;
}

export default function EmbeddedIFrame({
  src = "",
}: Props) {
  return (
    <div className="h-full">
      <iframe
        src={src}
        title="Embedded Web Page"
        width="100%"
        height="100%"
        allowFullScreen
      />
    </div>
  );
}
