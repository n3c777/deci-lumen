import React, { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import AudioList from "../components/AudioList";
import ProcessAudio from "../components/ProcessAudio";
import { useNavigate } from "react-router-dom";

function UploadIndividual() {
  const [trigger, setTrigger] = useState(null);
  const [selectedAudioId, setSelectedAudioId] = useState(null);

  const navigate = useNavigate();

  const goToCollective = () => {
    navigate("/upload-collective");
  };

  const sendData = async () => {
    try {
      await processAllAudio();
      await sendMqttData();
      navigate("/audio-visual");
    } catch (error) {
      console.error("Error in sending data:", error);
    }
  };

  const processAllAudio = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/process_all_individual_audio",
        {
          method: "POST",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error processing audio files:", error);
    }
  };

  const sendMqttData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
      } else {
        console.error("Failed to publish processed audio tracks");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={goToCollective}>Go Back</button>

      <h2>Upload individual Audio Tracks</h2>
      <UploadAudio setTrigger={setTrigger} isIndividual={true} />
      <AudioList
        trigger={trigger}
        onSelectAudio={setSelectedAudioId}
        isIndividual={true}
      />
      <button onClick={sendData}>Send Data</button>
    </div>
  );
}

export default UploadIndividual;
