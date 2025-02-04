import React from "react";
import "../styles/buttonStyle.css";

/*
Its a button
*/
function button({ title, onClick }) {
  return <button onClick={onClick}>{title}</button>;
}

export default button;
