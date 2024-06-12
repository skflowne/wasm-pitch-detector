import React, { useState } from "react";
import "./App.css";

import { setupAudio } from "./setupAudio";
import FrequencyMap from "note-frequency-map";

const PitchReadout = ({ running, latestPitch }) => {
  const note = latestPitch ? FrequencyMap.noteFromFreq(latestPitch) : null;
  return (
    <div className="Pitch-readout">
      {latestPitch ? (
        <div>
          <p className="pitch">Latest pitch: {latestPitch.toFixed(1)} Hz</p>
          <p className="note">Latest note: {note.note}</p>
        </div>
      ) : running ? (
        "Listening..."
      ) : (
        "Paused"
      )}
    </div>
  );
};

const AudioRecorderControl = () => {
  const [audio, setAudio] = useState(undefined);
  const [running, setRunning] = useState(false);
  const [latestPitch, setLatestPitch] = useState(undefined);

  const onStart = async () => {
    setAudio(await setupAudio(setLatestPitch));
    setRunning(true);
  };

  if (!audio) {
    return <button onClick={onStart}>Start Listening</button>;
  }

  const { context } = audio;
  const toggleRecording = async () => {
    if (running) {
      await context.suspend();
      setRunning(false);
    } else {
      await context.resume();
      setRunning(true);
    }
  };
  return (
    <div>
      <button onClick={toggleRecording}>{running ? "Pause" : "Resume"}</button>
      <PitchReadout running={running} latestPitch={latestPitch} />
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <div className="App-content">
        <AudioRecorderControl />
      </div>
    </div>
  );
};

export default App;
