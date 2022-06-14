import React from "react";
import "../Styles.scss";
import logoOuter from "../fyv_logo_outer.png";

export const Header = () => {
  return (
    <header className="App-header">
      <h3>share my wisdom with F.Y.V.</h3>
      <img src={logoOuter} className="App-logo" alt="logoOuter" />
    </header>
  );
};
