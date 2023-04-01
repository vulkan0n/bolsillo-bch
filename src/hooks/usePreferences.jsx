import { useSelector, useDispatch } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";

// TODO: delete this; refactor stopgap
function usePreferences() {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

  console.log("usePreferences", preferences);

  return {
    preferences,
    setPreference: (key, value) => dispatch(setPreference({ key, value })),
  };
}

export default usePreferences;
