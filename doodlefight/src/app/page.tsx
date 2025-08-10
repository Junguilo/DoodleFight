// @ts-nocheck
"use client"
import {useRef, useEffect, useState} from 'react';
import Image from "next/image";
import Classifier from "./classifier";
import DoodleCanvas from "./components/canvas.tsx"

//
export default function Home() {
  const canvasRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    console.log("set to true");
  }, [canvasReady])


  const getDownload = () => {
    if(canvasRef.current){
      canvasRef.current.debugDownload();
    } else {
      console.error("CanvasRef not available")
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-0">
      <h1 className="text-2xl font-bold mb-4">Doodle Fight</h1>
      <div className=" w-[600px] h-[600px] border-4 border-black rounded-md overflow-hidden shadow-lg">
      <DoodleCanvas
        ref={canvasRef}
        onReady={() => {
          setCanvasReady(true)
          console.log("setting it to true")
        }}
      />
      
      </div>
      <div className="mt-4">
        <button 
          onClick={getDownload}
          disabled={!canvasReady} 
          className={`px-4 py-2 rounded ${canvasReady 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        > 
          {canvasReady ? "Download" : "Loading Canvas..."}
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Canvas Status: {canvasReady ? "Ready" : "Loading"}
        </p>
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start p-5">
        Rememeber to wait for the model to load,
        If it loads during drawing it will cause the canvas to bug out a bit
        <Classifier />
      </main>
    </div>
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-8 font-[family-name:var(--font-geist-sans)]">
    //   <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
    //     <div className="flex items-center">
    //       <Image
    //         src="/hf-logo.svg"
    //         alt="Hugging Face logo"
    //         width={50}
    //         height={50}
    //         priority
    //       />
    //       <span className="text-4xl font-light mx-5">&#xd7;</span>
    //       <Image
    //         className="dark:invert"
    //         src="/next.svg"
    //         alt="Next.js logo"
    //         width={180}
    //         height={38}
    //         priority
    //       />
    //     </div>
    //     <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
    //       <li className="mb-2">
    //         Get started by editing{" "}
    //         <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
    //           app/page.js
    //         </code>
    //         .
    //       </li>
    //       <li className="mb-2">
    //         Update Transformers.js code in{" "}
    //         <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
    //           app/classify.js
    //         </code>
    //         .
    //       </li>
    //       <li>Save and see your changes instantly.</li>
    //     </ol>

    //     <div className="flex gap-4 items-center flex-col sm:flex-row">
    //       <a
    //         className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    //         href="https://github.com/huggingface/transformers.js-examples/tree/main/next-client"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Source code
    //       </a>

    //       <a
    //         className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    //         href="https://huggingface.co/docs/transformers.js/index"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Read our docs
    //       </a>
    //     </div>
  
    //     <Classifier />
    //   </main>
    //   <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://github.com/huggingface/transformers.js"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/github.svg"
    //         alt="GitHub icon"
    //         width={16}
    //         height={16}
    //       />
    //       Transformers.js
    //     </a>
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://github.com/huggingface/transformers.js-examples"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/window.svg"
    //         alt="Window icon"
    //         width={16}
    //         height={16}
    //       />
    //       Examples
    //     </a>
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://hf.co"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/globe.svg"
    //         alt="Globe icon"
    //         width={16}
    //         height={16}
    //       />
    //       Go to hf.co →
    //     </a>
    //   </footer>
    // </div>
  );
}
