import React from "react";

function AudioVisual() {
  const finishSession = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/delete_all_raw_audio",
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting audio files:", error);
    }
  };

  return (
    <>
      <h1>Audio Visual</h1>
      <button onClick={finishSession}>Finish Session</button>
    </>
  );
}

export default AudioVisual;
