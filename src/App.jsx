import React, { useState } from "react";
import { Upload, Shield, Image } from "lucide-react";

/* ---------------- BACKEND API ---------------- */

async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    body: formData,
  });

  return await response.json();
}

/* ---------------- NAVBAR ---------------- */

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0F13]/80 backdrop-blur-lg border-b border-cyan-500/20">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
      <Shield className="w-8 h-8 text-cyan-400 mr-2" />
      <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        AuthentiScan
      </span>
    </div>
  </nav>
);

/* ---------------- UPLOAD BOX ---------------- */

const HeroUploadBox = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    onUpload(file, previewURL);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Upload an Image
        </h1>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-3xl p-12 transition-all ${
            isDragging
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-gray-700 bg-gray-900/40 hover:border-cyan-500/50"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            id="file-upload"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
            <p className="text-lg font-semibold text-gray-200">
              Drop your image or click to browse
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

/* ---------------- RESULTS ---------------- */

const AnalysisResults = ({ preview, data, onReset }) => (
  <div className="min-h-screen px-4 pt-24">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Analysis Result
        </h1>

        <button
          onClick={onReset}
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl"
        >
          Analyze Another
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="bg-gray-900/70 rounded-3xl p-6 border border-cyan-500/30">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Image className="w-5 h-5 mr-2 text-cyan-400" />
            Uploaded Image
          </h2>
          <img
            src={preview}
            alt="Uploaded"
            className="rounded-xl w-full object-contain"
          />
        </div>

        {/* Classification */}
        <div className="bg-gray-900/70 rounded-3xl p-6 border border-cyan-500/30">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">
            Classification
          </h2>

          <p className="mb-2">
            <strong>Type:</strong>{" "}
            <span className="text-cyan-300">{data.image_type}</span>
          </p>

          {data.subtype && (
            <p className="mb-2">
              <strong>Subtype:</strong>{" "}
              <span className="text-cyan-300">{data.subtype}</span>
            </p>
          )}

          <p className="mb-4">
            <strong>Confidence:</strong>{" "}
            <span className="text-cyan-300">{data.confidence}</span>
          </p>

          <h3 className="font-semibold mb-2">Reasons:</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {data.reason.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async (file, previewURL) => {
    setPreview(previewURL);
    const backendData = await analyzeImage(file);
    setResult(backendData);
  };

  return (
    <div className="min-h-screen bg-[#0D0F13] text-white">
      <Navbar />

      {!result ? (
        <HeroUploadBox onUpload={handleUpload} />
      ) : (
        <AnalysisResults
          preview={preview}
          data={result}
          onReset={() => {
            setPreview(null);
            setResult(null);
          }}
        />
      )}
    </div>
  );
}
