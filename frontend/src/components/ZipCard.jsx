import { useState } from "react";

export default function ZipCard() {
  const [zipFile, setZipFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".zip")) setZipFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) setZipFile(file);
  };

  const handleZipAnalyze = () => {
    if (!zipFile) return;
    // TODO: POST /api/scan/zip avec FormData
    console.log("Analyze ZIP:", zipFile.name);
  };

  return (
    <div className="card zip">
      <div>
        <div className="card-label">
          <span className="dot" />
          Option 2
        </div>
        <div className="card-title">Fichier ZIP</div>
        <div className="card-desc">
          Exportez votre projet en archive ZIP et déposez-le directement ici.
        </div>
      </div>

      <div
        className={`dropzone${dragOver ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept=".zip" onChange={handleFileInput} />
        <div className="dropzone-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p>{dragOver ? "Déposez le fichier ici" : "Glissez votre .zip ou cliquez"}</p>
        {zipFile && <p className="file-name">📦 {zipFile.name}</p>}
      </div>

      <button
        className={`btn-analyze${zipFile ? " active" : ""}`}
        onClick={handleZipAnalyze}
        disabled={!zipFile}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Analyser le projet
      </button>
    </div>
  );
}
