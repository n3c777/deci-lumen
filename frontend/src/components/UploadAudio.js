import React, { useState } from "react";
import axios from "axios";
import Button from "./Button";

function UploadAudio({ setTrigger, isIndividual }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    console.log("isIndividual:", isIndividual);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_individual", isIndividual);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    try {
      await axios.post("http://127.0.0.1:5000/upload_raw_audio", formData);
      alert("File uploaded successfully.");
      setTrigger((prev) => !prev);
    } catch (error) {
      alert("Error uploading file.");
    }
  };

  return (
    <div>
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <Button title={"Upload"} onClick={handleUpload} />
    </div>
  );
}

export default UploadAudio;
