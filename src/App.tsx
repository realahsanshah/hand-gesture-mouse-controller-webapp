import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  createDetector,
  SupportedModels,
} from "@tensorflow-models/hand-pose-detection";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import { useAnimationFrame } from "./lib/hooks/useAnimationFrame";
import { drawHands } from "./utils";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`
);

async function setupVideo() {
  const video: any = document.getElementById("video");
  const stream = await window.navigator.mediaDevices.getUserMedia({
    video: true,
  });

  video.srcObject = stream;
  await new Promise((resolve: any) => {
    video.onloadedmetadata = () => {
      resolve();
    };
  });
  video.play();

  video.width = video.videoWidth;
  video.height = video.videoHeight;

  return video;
}

async function setupDetector() {
  const model = SupportedModels.MediaPipeHands;
  const detector: any = await createDetector(model, {
    runtime: "mediapipe",
    maxHands: 2,
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
  });

  return detector;
}

async function setupCanvas(video: any) {
  const canvas: any = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.width;
  canvas.height = video.height;

  return ctx;
}

function App() {
  const detectorRef = useRef<any>();
  const videoRef = useRef<any>();
  const [ctx, setCtx] = useState<any>();
  const cursorRef = useRef<any>();

  const setup = async () => {
    videoRef.current = await setupVideo();
    const detector = await setupDetector();
    const ctx = await setupCanvas(videoRef.current);

    detectorRef.current = detector;
    setCtx(ctx);
  };

  useEffect(() => {
    setup();
    return () => {};
  }, []);

  useAnimationFrame(async (delta: any) => {
    const hands = await detectorRef.current.estimateHands(videoRef?.current, {
      flipHorizontal: false,
    });

    ctx.clearRect(
      0,
      0,
      videoRef.current.videoWidth,
      videoRef.current.videoHeight
    );
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.videoWidth,
      videoRef.current.videoHeight
    );
    drawHands(hands, ctx, cursorRef);
  }, !!(detectorRef.current && videoRef.current && ctx));

  return (
    <div className="App">
      <header className="App-header">
        <canvas
          style={{
            transform: "scaleX(-1)",
            zIndex: 1,
            borderRadius: "1rem",
            boxShadow: "0 3px 10px rgb(0 0 0)",
            maxWidth: "85vw",
          }}
          id="canvas"
        ></canvas>
        <video
          style={{
            visibility: "hidden",
            transform: "scaleX(-1)",
            position: "absolute",
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          }}
          id="video"
          playsInline
        ></video>
      </header>
      <img
        id="cursor"
        src="https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png"
        width="15"
        height="20"
        ref={cursorRef}
      />
    </div>
  );
}

export default App;
