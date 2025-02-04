import React, { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import AudioList from "../components/AudioList";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/*
Upload individual is one of two uploading pages. 
Users can upload their individual tracks (master tracks)

This page is has navigation functions (goCollective and goToAudioVisual)
This page uses the UploadAudio component and passes in  true for 
inIndividual signifying that its a individual track

This also has user validation that checks to see wether  
the user has uploaded to little or too many tracks
in the max is 5 tracks

*/

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
      setErrorMessage("The number of audio tracks must be 2");
    } else {
      await processAllAudio();
      navigate("/audio-visual");
    }
  };

  const checkUpload = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/raw_audio_list", {
        params: { is_individual: true },
      });

      const numberOfAudioTracks = response.data.length;
      if (numberOfAudioTracks == 2) return true;
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
      <button onClick={goToBlueTooth}>Upload All</button>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
}

export default UploadIndividual;
