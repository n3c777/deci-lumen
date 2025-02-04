import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactAudioPlayer from "react-audio-player";

/*
This component lists the audio tracks useing react audio player.
User passes in the two props trigger and isIndividual. 

trigger
the trigger is activated by setTrigger in the upload audio component.
This is so that the play back is rendered when the user presses the upload buttom

IsIndiviual
Allows devs to choose wether the type of audio track is indivdual or the collective audio track
This is for reusibility

The audio is fetched upon loading of the page with useEffect

deleteAduio is self explanitory
*/

function AudioList({ trigger, isIndividual }) {
  const [audios, setAudios] = useState([]);

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/raw_audio_list",
          {
            params: { is_individual: isIndividual },
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
