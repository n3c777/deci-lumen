import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function ProcessAudio({ audioId }) {
  const [decibelData, setDecibelData] = useState([]);
  const [error, setError] = useState(null);
  const [dataSize, setDataSize] = useState(null); // JSON size
  const [measurementsPerSecond, setMeasurementsPerSecond] = useState(null); // Decibel measurements per second

  const processAudio = async () => {
    try {
      // Post request to process the audio
      const processResponse = await axios.post(
        `http://127.0.0.1:5000/process_audio/${audioId}`
      );

      // Get decibel data size and measurements per second from the response
      setDataSize(processResponse.data.decibel_data_size);
      setMeasurementsPerSecond(processResponse.data.measurements_per_second);

      // Get decibel data after processing
      const response = await axios.get(
        `http://127.0.0.1:5000/decibel_data/${audioId}`
      );
      setDecibelData(response.data.decibel_levels);
    } catch (err) {
      setError("Error processing audio");
    }
  };

  // Data for the decibel graph
  const data = {
    labels: decibelData.map((_, index) => index), // X-axis labels (index of downsampled decibels)
    datasets: [
      {
        label: "Decibel Level (Downsampled)",
        data: decibelData,
        borderColor: "rgb(255, 255, 255)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <button onClick={processAudio}>Process Decibel Levels</button>
      {error && <p>{error}</p>}

      {/* Display the decibel waveform if data is available */}
      <div>
        {decibelData.length > 0 && (
          <div style={{ width: "100%", height: "400px" }}>
            <h3>Decibel Waveform</h3>
            <Line data={data} />
          </div>
        )}
      </div>

      {/* Display data size and measurements per second */}
      <div>
        {dataSize && <p>Data Size: {dataSize} bytes</p>}
        {measurementsPerSecond && (
          <p>Measurements per Second: {measurementsPerSecond.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

export default ProcessAudio;
