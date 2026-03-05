import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:4000";

export default function ZipCard() {
  const [zipFile, setZipFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const navigate = useNavigate();

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

  const handleZipAnalyze = async () => {
    if (!zipFile) return;
    setIsScanning(true);
    setScanError("");
    try {
      const formData = new FormData();
      formData.append("project", zipFile);
      const res = await fetch(`${API}/api/scan/zip`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const results = await res.json();
      navigate("/dashboard", { state: { results } });
    } catch (e) {
      setScanError(e.message || "Une erreur est survenue lors du scan.");
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="scan-overlay">
        {scanError ? (
          <>
            <div className="scan-overlay-error">{scanError}</div>
            <button className="scan-overlay-retry" onClick={() => { setScanError(""); setIsScanning(false); }}>
              Retour
            </button>
          </>
        ) : (
          <>
            <div className="scan-overlay-spinner" />
            <div className="scan-overlay-title">Analyse en cours...</div>
            <div className="scan-overlay-sub">Scan de {zipFile.name}</div>
          </>
        )}
      </div>
    );
  }

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
        {zipFile && <p className="file-name">{zipFile.name}</p>}
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
