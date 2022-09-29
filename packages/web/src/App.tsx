import React from "react";
import "./App.css";
import TYPOGRAPHY from "@selene/common/design/typography";
import Header from "./components/Header";

function App() {
  return (
    <div className="App">
      <Header />

      <p style={TYPOGRAPHY.h1black}>green text</p>
    </div>
  );
}

export default App;
