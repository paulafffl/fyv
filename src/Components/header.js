import React from "react";
import "../Styles.scss";
import logoOuter from "../fyv_logo_outer.png";

export const Header = () => {
  return (
    <header className="App-header">
      <img src={logoOuter} className="App-logo" alt="logoOuter" />
    </header>
  );
};
