// @ts-nocheck
"use client"

import {useEffect, useRef, useState, useImperativeHandle, forwardRef} from 'react';
import {throttle} from '../utils.tsx'; //improve performance

import constants from '../constants.js';

const DoodleCanvas = forwardRef(({onReady, onDrawStart, onDrawEnd, onDraw, ...props}, ref) => {
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
        
        // Get parent container dimensions for better sizing
        const parent = canvas.parentElement;
        const parentWidth = parent ? parent.clientWidth : 600;
        const parentHeight = parent ? parent.clientHeight : 600;
        
        //canvas height/width - using parent dimensions with device pixel ratio for high DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parentWidth * dpr;
        canvas.height = parentHeight * dpr;
        canvas.style.width = `${parentWidth}px`;
        canvas.style.height = `${parentHeight}px`;

        //getting access to the 2d Drawing API 
        if(!contextRef.current){
            contextRef.current = canvas.getContext('2d', { willReadFrequently: true});
        }

        //setting up the brushes
        const context = contextRef.current;
        context.scale(dpr, dpr);
        context.lineWidth = constants.BRUSH_SIZE;
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
        
        // Initialize bounding box on first point
        if (sketchBoundingBox === null) {
            setSketchBoundingBox([offsetX, offsetY, offsetX, offsetY]);
        } else {
            // Update bounding box with new point
            updateBoundingBox(offsetX, offsetY);
        }
        
        // Notify parent that drawing has started
        if (typeof onDrawStart === 'function') {
            onDrawStart();
        }
    }

    const draw = ({nativeEvent}) => {
        if(!isDrawing) return;

        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        
        // Update bounding box while drawing
        updateBoundingBox(offsetX, offsetY);
        
        // Call onDraw callback if provided
        if (typeof onDraw === 'function') {
            onDraw();
        }
    };
    
    // Helper function to update the bounding box
    const updateBoundingBox = (x, y) => {
        setSketchBoundingBox(prev => {
            if (!prev) return [x, y, x, y];
            return [
                Math.min(prev[0], x),
                Math.min(prev[1], y),
                Math.max(prev[2], x),
                Math.max(prev[3], y)
            ];
        });
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
        
        // Notify parent that drawing has ended
        if (typeof onDrawEnd === 'function') {
            onDrawEnd();
        }
    }

    //center the drawing and format the canvas for the model.
    const getCanvasData = () => {
        if (sketchBoundingBox === null) {
            console.log("No drawing detected");
            return null;
        }

        const context = contextRef.current;
        const dpr = window.devicePixelRatio || 1;
        
        // Get the bounding box with padding
        let [x1, y1, x2, y2] = sketchBoundingBox;
        
        // Add padding
        const paddingAmount = SKETCH_PADDING * 2; // Increase padding for better results
        x1 = Math.max(0, x1 - paddingAmount);
        y1 = Math.max(0, y1 - paddingAmount);
        x2 = Math.min(canvasRef.current.width / dpr, x2 + paddingAmount);
        y2 = Math.min(canvasRef.current.height / dpr, y2 + paddingAmount);
        
        // Calculate dimensions
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Ensure it's square by taking the larger dimension
        const size = Math.max(width, height);
        
        // Center the drawing in the square
        let centerX = (x1 + x2) / 2;
        let centerY = (y1 + y2) / 2;
        
        // Calculate the square coordinates
        const squareX1 = Math.max(0, centerX - size / 2);
        const squareY1 = Math.max(0, centerY - size / 2);
        
        // Make sure we don't go out of bounds
        const maxSize = Math.min(
            size,
            canvasRef.current.width / dpr - squareX1,
            canvasRef.current.height / dpr - squareY1
        );
        
        console.log("Getting image data from", squareX1, squareY1, maxSize, maxSize);
        
        // Get the image data for the square region
        const imgData = context.getImageData(
            squareX1 * dpr, 
            squareY1 * dpr, 
            maxSize * dpr, 
            maxSize * dpr
        );

        return imgData;
    }

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        debugDownload: () => {
            if (contextRef.current && canvasRef.current) {
                debugDownload();
            } else {
                console.error("Canvas not fully initialized");
            }
        },
        getCanvasData: () => {
            if (contextRef.current && canvasRef.current) {
                return getCanvasData();
            } else {
                console.error("Canvas not fully initialized");
                return null;
            }   
        },
        // Add a way to access the canvas element directly
        getCanvasElement: () => canvasRef.current,
        // Add a method to reset the canvas state
        resetState: () => {
            setIsDrawing(false);
            setSketchBoundingBox(null);
        },
        // Add a method to visualize the bounding box
        visualizeBoundingBox: () => {
            visualizeBoundingBox();
        }
    }));

    return(
        <div className="w-full h-full" 
            onTouchMove={(e) => e.preventDefault()}
            onMouseMove={(e) => e.preventDefault()}
        >
            <canvas                 
                ref={canvasRef}
                onMouseDown={(e) => {
                    e.preventDefault();
                    startDrawing(e);
                }}
                onMouseMove={(e) => {
                    e.preventDefault();
                    draw(e);
                }}
                onMouseUp={(e) => {
                    e.preventDefault();
                    finishDrawing();
                }}
                onMouseLeave={(e) => {
                    e.preventDefault();
                    finishDrawing();
                }}
                className="w-full h-full"
            />
        </div>
    );
});

DoodleCanvas.displayName = 'DoodleCanvas';

export default DoodleCanvas;
