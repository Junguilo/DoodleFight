// @ts-nocheck
"use client"

import {useEffect, useRef, useState, useImperativeHandle, forwardRef} from 'react';
import {throttle} from '../utils.tsx'; //improve performance

import constants from '../constants.js';

const DoodleCanvas = forwardRef(({onReady, ...props}, ref) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    //Variables to get image
    const brushRadius = constants.BRUSH_SIZE/2;
    
    //[x1, y1, x2, y2]
    const [sketchBoundingBox, setSketchBoundingBox] = useState(null); 
    const SKETCH_PADDING = 4;
    const [isInitialized, setIsInitialized] = useState(false);

    //initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        //canvas height/width
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        //getting access to the 2d Drawing API 
        if(!contextRef.current){
            contextRef.current = canvas.getContext('2d', { willReadFrequently: true});
        }

        //setting up the brushes
        const context = contextRef.current;
        context.scale(2, 2);
        context.imageSmoothingEnabled = true;
        context.lineWidth = constants.BRUSH_SIZE/2;
        context.lineCap = 'round';
        context.strokeStyle = 'black';

        // Mark as initialized
        setIsInitialized(true);
        
        // Call onReady callback if it exists
        if (typeof onReady === 'function') {
            console.log("Canvas initialization complete, calling onReady");
            onReady();
        }
    }, []);

    //nativeEvent is x,y our mousePosition
    const startDrawing = ({nativeEvent}) => {
        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }

    const draw = ({nativeEvent}) => {
        if(!isDrawing) return;

        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    }

    const getCanvasData = () => {
        if (sketchBoundingBox === null) return null;

        const context = contextRef.current;

        // Ensure sketch is square (and that aspect ratio is maintained)
        let left = sketchBoundingBox[0];
        let top = sketchBoundingBox[1];
        let width = sketchBoundingBox[2] - sketchBoundingBox[0];
        let height = sketchBoundingBox[3] - sketchBoundingBox[1];
        let sketchSize = 2 * SKETCH_PADDING;

        // Center the crop
        if (width >= height) {
        sketchSize += width;
        top = Math.max(top - (width - height) / 2, 0);
        } else {
        sketchSize += height;
        left = Math.max(left - (height - width) / 2, 0);
        }

        //left - SKETCH_PADDING, top - SKETCH_PADDING, sketchSize, sketchSize
        const imgData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);


        return imgData;
    }

    const debugDownload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Get ImageData (assuming you have a specific region you want to download)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 

        // Create a temporary canvas for conversion
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0); // Put the imageData onto the temporary canvas

        // Convert to data URL
        const dataURL = tempCanvas.toDataURL('image/png'); // Specify PNG format

        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'my-image.png'; // Set desired filename
        document.body.appendChild(link); // Append link to the document body
        link.click(); // Trigger the download
        document.body.removeChild(link); // Remove the link after download
    }

    // Expose methods to parent
    //Need to expose getCanvasData & ClearCanvas functions to parent
    useImperativeHandle(ref, () => ({
        debugDownload: () => {  //debugDownload
            if (contextRef.current && canvasRef.current) {
                debugDownload();
            } else {
                console.error("Canvas not fully initialized");
            }
        },
        getCanvasData: () => {  //getCanvasData
            if (contextRef.current && canvasRef.current) {
                getCanvasData();
            } else {
                console.error("Canvas not fully initialized");
            }   
        }
    }));


    return(
        <div>
            <canvas                 
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing} //if mouse leaves canvas
            />
        </div>
    );
});
DoodleCanvas.displayName = 'DoodleCanvas';

export default DoodleCanvas;