import React from "react";
import "./App.css";
import TYPOGRAPHY from "@selene/common/dist/design/typography";
import Header from "./components/Header";
import Content from "./components/Content";
// import WebApp from "@selene/app/src/App";

function App() {
  return (
    <div className="App">
      <Header />
      <Content />
      {/* <WebApp /> */}

      <p style={TYPOGRAPHY.h1black}>green text</p>
    </div>
  );
}

export default App;
