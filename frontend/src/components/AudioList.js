import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactAudioPlayer from "react-audio-player";

function AudioList({ trigger, isIndividual }) {
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/raw_audio_list",
          {
            params: { is_individual: isIndividual }, // Pass isIndividual as a query parameter
          }
        );
        setAudios(response.data);
      } catch (error) {
        console.error("Error fetching audio files:", error);
      }
    };
    fetchAudios();
  }, [trigger, isIndividual]);

  const deleteAudio = async (audioId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete_raw_audio/${audioId}`);
      alert("File deleted successfully.");

      setAudios((prevAudios) =>
        prevAudios.filter((audio) => audio.id !== audioId)
      );
    } catch (error) {
      alert("Error deleting file.");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Audio Files</h2>
      {audios.map((audio) => (
        <div key={audio.id} style={{ marginBottom: "20px" }}>
          <p>{audio.filename}</p>
          <ReactAudioPlayer
            src={`http://127.0.0.1:5000/raw_audio/${audio.id}`}
            controls
          />

          <button
            onClick={() => deleteAudio(audio.id)}
            style={{ marginLeft: "10px", marginTop: "10px" }}
          >
            Delete Audio File
          </button>
        </div>
      ))}
    </div>
  );
}

export default AudioList;
