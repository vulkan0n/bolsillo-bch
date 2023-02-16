import { NavLink } from "react-router-dom";

function WalletViewTabs() {
  return (
    <div>
      <NavLink to="send">Send</NavLink>
      <NavLink to="">Receive</NavLink>
    </div>
  );
}

export default WalletViewTabs;
