import React from "react";
import { useNavigate } from "react-router-dom";

/*
The welcome page
*/
function Welcome() {
  const navigate = useNavigate();

  const navigateToUpload = () => {
    navigate("/upload-collective");
  };

  return (
    <>
      <h1>Welcome to Decilumen</h1>
      <button onClick={navigateToUpload}>Get Started</button>
    </>
  );
}

export default Welcome;
