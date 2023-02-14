import MainViewBalance from "./mainView/MainViewBalance";
import MainViewReceive from "./mainView/MainViewReceive";
import MainViewSend from "./mainView/MainViewSend";

function MainView() {
  return (
    <div>
      <MainViewBalance />
      <MainViewReceive />
    </div>
  );
}

export default MainView;

