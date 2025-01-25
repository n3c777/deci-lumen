import React, { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import AudioList from "../components/AudioList";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UploadIndividual() {
  const [trigger, setTrigger] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAudioId, setSelectedAudioId] = useState(null);

  const navigate = useNavigate();

  const goToCollective = () => {
    navigate("/upload-collective");
  };

  const goToBlueTooth = async () => {
    const isUploadValid = await checkUpload();
    if (!isUploadValid) {
      setErrorMessage(
        "The number of audio tracks must be between or equal to 1 & 5"
      );
    } else {
      await processAllAudio();
      navigate("/audio-visual");
    }
  };

  const sendData = async () => {
    try {
      try {
        const isUploadValid = await checkUpload();
        if (!isUploadValid) {
          setErrorMessage(
            "The number of audio tracks must be between or equal to 1 & 5"
          );
        } else {
          setErrorMessage("");
          navigate("/audio-visual");
          await processAllAudio();
          await sendMqttData();
        }
      } catch (error) {
        console.error("Error in goToIndividual:", error);
        setErrorMessage("An error occurred while validating the upload.");
      }
    } catch (error) {
      console.error("Error in sending data:", error);
    }
  };

  const checkUpload = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/raw_audio_list", {
        params: { is_individual: true },
      });

      const numberOfAudioTracks = response.data.length;
      if (numberOfAudioTracks > 0 && numberOfAudioTracks < 6) return true;
    } catch (error) {
      console.error("Error fetching audio files:", error);
      return false;
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
      <button onClick={sendData}>Send Data Through MQTT</button>
      <button onClick={goToBlueTooth}>Send Data Through Bluetooth</button>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}

export default UploadIndividual;
