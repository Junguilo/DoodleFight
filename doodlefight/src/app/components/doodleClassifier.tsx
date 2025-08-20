// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { pipeline, RawImage } from "@huggingface/transformers";
import DoodleCanvas from "./canvas";
import constants from "../constants.js"; // Import constants

export default function DoodleClassifier() {
  const [predictions, setPredictions] = useState([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const classifyTimeoutRef = useRef(null);
  
  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Initialize the pipeline
        modelRef.current = await pipeline(
          "image-classification",
          "Xenova/quickdraw-mobilevit-small", //model has built in labels
          { quantized: false }
        );
        setIsModelLoaded(true);
        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    
    loadModel();
  }, []);
  
  // Throttled classification function to avoid too many classifications while drawing
  const throttledClassify = () => {
    // Clear any existing timeout
    if (classifyTimeoutRef.current) {
      clearTimeout(classifyTimeoutRef.current);
    }
    
    classifyTimeoutRef.current = setTimeout(() => {
      classifyDrawing();
    }, 10); // Much faster classification like Xenova
  };
  
  // Function to classify the drawing
  const classifyDrawing = async () => {
    if (!canvasRef.current || !modelRef.current) {
      console.error("Canvas or model not initialized");
      return;
    }
    
    try {
      // Get the image data from the canvas
      const imageData = canvasRef.current.getCanvasData();
      
      if (!imageData) {
        // If no drawing is detected, keep the predictions but mark them as empty
        // This keeps the UI consistent
        return;
      }
      
      console.log("Image dimensions:", imageData.width, "x", imageData.height);
      
      // Use Xenova's approach: Convert RGBA to grayscale using alpha channel
      const data = new Uint8ClampedArray(imageData.data.length / 4);
      for (let i = 0; i < data.length; ++i) {
        data[i] = imageData.data[i * 4 + 3]; // Extract alpha channel only
      }
      
      // Create RawImage directly from alpha channel data
      const rawImage = new RawImage(data, imageData.width, imageData.height, 1);
      
      // Classify the image with the raw grayscale data
      //model classification, returns an array of what the objects will look like
      const results = await modelRef.current(rawImage);
      
      // Filter out banned labels
      const filteredResults = results.filter(
        prediction => !constants.BANNED_LABELS.includes(prediction.label)
      );
      
      // Update predictions
      setPredictions(filteredResults);
      console.log("Classification results:", filteredResults);
    } catch (error) {
      console.error("Error classifying drawing:", error);
    }
  };
  
  // Helper function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvasElement();
      const context = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      
      // Clear the entire canvas & MOre because it doesn't clear all the way for some reason
      context.clearRect(0, 0, canvas.width + 200, canvas.height + 200);
      
      // Reset the canvas state in the component
      canvasRef.current.resetState();
      
      // Reset predictions
      setPredictions([]);
    }
  };

  //Save the canvas for other uses later like displaying the fight & sent to your account to look back
  const saveCanvas = () => {
    if(canvasRef.current){
      const canvas = canvasRef.current.getCanvasElement();

      const dataURL = canvas.toDataURL('image/png');

      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `doodle-${Date.now()}.png`; // Unique filename with timestamp
      link.href = dataURL;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="flex flex-col items-start gap-4">
        <div className="flex-shrink-0 w-[400px] h-[400px] border-4 border-black rounded-md overflow-hidden shadow-lg">
            <DoodleCanvas 
            ref={canvasRef}
            onReady={() => console.log("Canvas ready")}
            onDrawStart={() => {
                setIsDrawing(true);
            }}
            onDrawEnd={() => {
                setIsDrawing(false);
                classifyDrawing(); 
            }}
            onDraw={throttledClassify} 
            />
        </div>
      
        <div className="flex-1 min-w-[400px] max-w-[400px]">

          <div className="mb-4 flex justify-between">
          <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
              Clear
          </button>
          <button
            onClick={saveCanvas}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
          </div>
        
          <div className="w-full">
          <h3 className="text-lg font-bold mb-1">Your Three Predictions!</h3>
          <p className="text-sm mb-3"> The higher the prediction the more effective a doodle will be!</p>
              <div className="border border-gray-300 rounded p-2 min-h-[150px]">
                  {predictions.length > 0 ? (
                  <ul>
                      {predictions.slice(0, 3).map((prediction, index) => (
                      <li key={prediction.label} className="flex justify-between items-center p-1 mt-1">
                          <span className="font-medium">{prediction.label}</span>
                          <div className="flex items-center">
                          <span className="w-16 text-right">{(prediction.score * 100).toFixed(2)}%</span>
                          </div>
                      </li>
                      ))}
                  </ul>
                  ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 mt-1">
                      {isModelLoaded ? "Draw something to see predictions" : "Loading model..."}
                  </div>
                  )}
              </div>
          </div>
        </div>
    </div>
  );
}
