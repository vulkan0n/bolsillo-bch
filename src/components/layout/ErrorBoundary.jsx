import Logger from "js-logger";
import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();
  Logger.error(error);

  return (
    <div>
      <div>{error.message}</div>
    </div>
  );
}
