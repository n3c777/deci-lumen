import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadIndividual from "./pages/UploadIndividual";
import Welcome from "./pages/Welcome";
import UploadCollective from "./pages/UploadCollective";
import AudioVisual from "./pages/AudioVisual";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/upload-individual" element={<UploadIndividual />} />
        <Route path="/upload-collective" element={<UploadCollective />} />
        <Route path="/audio-visual" element={<AudioVisual />} />
      </Routes>
    </Router>
  );
}

export default App;
