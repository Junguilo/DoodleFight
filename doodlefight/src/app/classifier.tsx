// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { pipeline, RawImage } from "@huggingface/transformers";

export default function Classifier() {
  const [text, setText] = useState("I love Transformers.js!");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const ref = useRef();

//text 
//   useEffect(() => {
//     ref.current ??= pipeline(
//       "text-classification",
//       "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
//     );
//   }, []);

//   useEffect(() => {
//     ref.current.then(async (classifier) => {
//       const result = await classifier(text);
//       setResult(result[0]);
//     });
//   }, [text]);

    // Load the image
    useEffect(() => {
        async function loadImage() {
        try {
            const img = await RawImage.read('https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ml-web-games/skateboard.png');
            setImage(img);
        } catch (err) {
            console.error("Error loading image:", err);
            setError("Failed to load image");
        }
        }
        
        loadImage();
    }, []);

    useEffect(() => {
    ref.current ??= pipeline(
      "image-classification",
      "Xenova/quickdraw-mobilevit-small",
      {quantized: false}
    );
    }, []);


  // Process the image when both model and image are ready
  useEffect(() => {
    if (!image) return; // Don't proceed if image isn't loaded yet
    
    ref.current.then(async (classifier) => {
      try {
        const grayscaleImage = image.grayscale();
        const result = await classifier(grayscaleImage);
        setResult(result[0]);
      } catch (err) {
        console.error("Error classifying image:", err);
        setError("Failed to classify image");
      }
    }).catch(err => {
      console.error("Error with model:", err);
      setError("Failed to load model");
    });
  }, [image]); // Only re-run when image changes

  return (
    <>
      <pre className="border border-gray-300 rounded p-2 dark:bg-black dark:text-white w-full min-h-[120px]">
        {result ? JSON.stringify(result, null, 2) : "Loading…"}
      </pre>
    </>
  );
}
