import React from "react";
import "./App.css";
import TYPOGRAPHY from "@selene-wallet/common/dist/design/typography";
import Header from "./components/Header";
import Content from "./components/Content";
import DailyActiveBitcoiners from "./components/DailyActiveBitcoiners";
// import WebApp from "@selene-wallet/app/src/App";

function App() {
  return (
    <div className="App">
      <Header />
      <Content />
      <DailyActiveBitcoiners />
      {/* <WebApp /> */}

      <p style={TYPOGRAPHY.h1black as any}>green text</p>
    </div>
  );
}

export default App;
