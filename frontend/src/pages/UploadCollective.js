import React, { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import AudioList from "../components/AudioList";
import ProcessAudio from "../components/ProcessAudio";
import { useNavigate } from "react-router-dom";

function UploadCollective() {
  const [trigger, setTrigger] = useState(null);
  const [selectedAudioId, setSelectedAudioId] = useState(null);

  const navigate = useNavigate();

  const goToIndividual = () => {
    navigate("/upload-individual");
  };
  const goToWelcome = () => {
    navigate("/");
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
    </div>
  );
}

export default UploadCollective;
