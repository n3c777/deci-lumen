import React, { useState } from "react";
import axios from "axios";
import BlueTooth from "../components/BlueTooth";
import DelayAudio from "../components/DelayAudio";
import { useNavigate } from "react-router-dom";

function AudioVisual() {
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();
  const startAudioVisual = async () => {
    const currentTime = new Date();
    const targetTime = new Date(currentTime.getTime() + 8000); // 10 seconds from now
    const epochTime = Math.floor(targetTime.getTime() / 1000);

    setStartTime(epochTime); // Pass the timestamp to the DelayAudio component
  };

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
        navigate("/");
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
      <DelayAudio epochTimestamp={startTime} />
      <BlueTooth epochTimestamp={startTime} />
      <button onClick={startAudioVisual}>Start Audio Visual</button>
      <button onClick={finishSession}>Finish Session</button>
    </>
  );
}

export default AudioVisual;
