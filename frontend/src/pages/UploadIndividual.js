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

  const sendData = () => {
    navigate("/audio-visual");
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
      {selectedAudioId && (
        <div>
          <h3>Process Selected Audio</h3>
          <ProcessAudio audioId={selectedAudioId} />
        </div>
      )}
      <button onClick={sendData}>Send Data</button>
    </div>
  );
}

export default UploadIndividual;
