import React, { useState, useEffect } from "react";

/*
The function of this blue tooth component is to 
-allow the user to scan for devices
-connect to a device
-retreive the processed json data and attach a time stamp to it upon receival of the time stamp
-send the data in chunks to the microcontroller

This component was made to seprate the bluetooth function from the rest of code for the audio visual page
*/

function BlueTooth({ epochTimestamp }) {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);

  const scanForDevices = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["35a3d836-c932-4b25-a881-80ab03c766b4"],
      });

      setDevices((prevDevices) => [...prevDevices, device]);
    } catch (error) {
      console.error("Error during device scan:", error);
    }
  };

  const connectToDevice = async (device) => {
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "35a3d836-c932-4b25-a881-80ab03c766b4"
      );
      const char = await service.getCharacteristic(
        "45193246-649b-4d84-ade9-17153d0e3211"
      );

      setConnectedDevice(device);
      setGattServer(server);
      setCharacteristic(char);

      console.log(`Connected to ${device.name || "Unnamed Device"}`);
    } catch (error) {
      console.error("Failed to connect to device:", error);
    }
  };

  const sendChunkedData = async (data) => {
    if (!characteristic) {
      alert("No device connected.");
      return;
    }

    const encoder = new TextEncoder();
    const CHUNK_SIZE = 512;

    const dataWithEndMarker = data + "<END>";

    for (let i = 0; i < dataWithEndMarker.length; i += CHUNK_SIZE) {
      const chunk = dataWithEndMarker.slice(i, i + CHUNK_SIZE);
      try {
        await characteristic.writeValue(encoder.encode(chunk));
        console.log(`Sent chunk: ${chunk}`);
      } catch (error) {
        console.error("Failed to send chunk:", error);
        break;
      }
    }
  };

  const fetchAndSendJSON = async () => {
    if (!epochTimestamp) {
      console.warn(
        "No epoch timestamp provided. Skipping Bluetooth data send."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/get_all_processed_audio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      const combinedData = {
        decibelData: data,
        timestamp: epochTimestamp,
      };

      const jsonString = JSON.stringify(combinedData);

      console.log("Fetched Combined JSON Data:", combinedData);
      await sendChunkedData(jsonString);
    } catch (error) {
      console.error("Error fetching or sending JSON data:", error);
    }
  };

  useEffect(() => {
    if (epochTimestamp) {
      fetchAndSendJSON();
    }
  }, [epochTimestamp]);

  return (
    <>
      <h1>Available Devices</h1>
      <button onClick={scanForDevices}>Scan for Devices</button>
      <ul>
        {devices.map((device, index) => (
          <li key={index}>
            {device.name || "Unnamed Device"} - {device.id}
            <button onClick={() => connectToDevice(device)}>Connect</button>
          </li>
        ))}
      </ul>
      {connectedDevice && (
        <div>
          <p>
            Connected to: {connectedDevice.name || "Unnamed Device"} (ID:{" "}
            {connectedDevice.id})
          </p>
        </div>
      )}
    </>
  );
}

export default BlueTooth;
