import React, { useState } from "react";
import axios from "axios";
import BlueTooth from "../components/BlueTooth";
import DelayAudio from "../components/DelayAudio";
import { useNavigate } from "react-router-dom";

/*
This page primarily to pl. 
-has a start audio visual button, and once pressed will retreive that current 
time and add 8 seconds to it, giving time for the microcontroller to process the data
-The future time stamp is used to signify the start of both the the lights and the audio playing. To
facilitate this, the time stamp is sent to both delay audio and bluetooth components
-The finish session button allows user to delete the all data in the 
data base and sends the user to the welcome page.
*/

function AudioVisual() {
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();
  const startAudioVisual = async () => {
    const currentTime = new Date();
    const targetTime = new Date(currentTime.getTime() + 8000);
    const epochTime = Math.floor(targetTime.getTime() / 1000);

    setStartTime(epochTime);
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
