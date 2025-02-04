import React, { useEffect, useRef } from "react";
import axios from "axios";

/*
With this component you can pass through a time stamp. Upon receival of the audio track the 
collective audio track is received. 
When the timestamp is hit the useRef is used to start the audio playback
*/

function DelayAudio({ epochTimestamp }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const loadAudioTrack = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/get_all_raw_audio",
          {
            params: { is_individual: false },
            responseType: "blob",
          }
        );

        const audioBlob = new Blob([response.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        console.log("Audio track loaded successfully");
      } catch (error) {
        console.error("Error fetching audio files:", error);
      }
    };

    loadAudioTrack();
  }, []);

  useEffect(() => {
    if (!epochTimestamp) return;

    const targetTime = epochTimestamp * 1000;
    const timeToWait = targetTime - Date.now();

    if (timeToWait > 0) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          console.log(`Audio playback started at: ${Date.now()} ms`);
        }
      }, timeToWait);

      return () => clearTimeout(timer);
    } else {
      console.error("Target time is in the past");
    }
  }, [epochTimestamp]);

  return <audio ref={audioRef} controls />;
}

export default DelayAudio;
