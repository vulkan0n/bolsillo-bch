import React from "react";
import logo from "./logo.svg";
import "./App.css";
import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";
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
