// @ts-nocheck
"use client"
import {useRef, useEffect, useState} from 'react';
import Image from "next/image";
import DoodleClassifier from "./components/doodleClassifier";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Doodle Fight</h1>
      <p className="text-lg mb-6">Draw something and Attack!</p>
      <DoodleClassifier />
    </div>
  );
}
