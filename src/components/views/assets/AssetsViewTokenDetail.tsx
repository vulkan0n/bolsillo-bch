import { useParams } from "react-router";
export default function AssetsViewTokenDetail() {
  const { tokenId } = useParams();

  return (
    <div>
      <div>Token Detail</div>
      <div>{tokenId}</div>
    </div>
  );
}
