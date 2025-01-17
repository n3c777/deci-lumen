import React, { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import AudioList from "../components/AudioList";
import ProcessAudio from "../components/ProcessAudio";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UploadCollective() {
  const [trigger, setTrigger] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAudioId, setSelectedAudioId] = useState(null);

  const navigate = useNavigate();

  const goToIndividual = async () => {
    try {
      const isUploadValid = await checkUpload();
      if (!isUploadValid) {
        setErrorMessage("The number of audio tracks must be 1");
      } else {
        setErrorMessage("");
        navigate("/upload-individual");
      }
    } catch (error) {
      console.error("Error in goToIndividual:", error);
      setErrorMessage("An error occurred while validating the upload.");
    }
  };

  const goToWelcome = () => {
    navigate("/");
  };

  const checkUpload = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/raw_audio_list", {
        params: { is_individual: false },
      });

      const numberOfAudioTracks = response.data.length;
      return numberOfAudioTracks === 1;
    } catch (error) {
      console.error("Error fetching audio files:", error);
      return false;
    }
  };

  return (
    <div>
      <button onClick={goToWelcome}>Go Back</button>
      <h2>Upload the Collective Audio Track</h2>
      <UploadAudio setTrigger={setTrigger} isIndividual={false} />
      <AudioList
        trigger={trigger}
        onSelectAudio={setSelectedAudioId}
        isIndividual={false}
      />
      {selectedAudioId && (
        <div>
          <h3>Process Selected Audio</h3>
          <ProcessAudio audioId={selectedAudioId} />
        </div>
      )}
      <button onClick={goToIndividual}>Next</button>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}

export default UploadCollective;
