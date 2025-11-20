import React, { useState, useRef } from "react";
import "./BusinessDataUpload.css";

export default function BusinessDataUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef();

    const handleFileSelect = (event) => {
        const selected = event.target.files[0];
        if (selected) {
            setFile(selected);
            if (onUploadSuccess) onUploadSuccess(selected);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            if (onUploadSuccess) onUploadSuccess(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="owner-main">
            <div className="upload-header">
                <h1>Upload Your Business Data</h1>
                <p>
                    Upload your Excel or CSV data file to enable break-even analysis,
                    pricing simulation, and cash flow tools.
                </p>
            </div>

            <div className="upload-card">
                <div className="upload-card-header">
                    <h2>Business Data Upload</h2>
                    <p className="upload-subtitle">Supported formats: .xlsx, .xls, .csv</p>
                </div>

                {!file && (
                    <div
                        className={`file-drop-zone ${isDragging ? "is-dragging" : ""}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="drop-zone-content">
                            <div
                                className={`cloud-icon-wrap ${isDragging ? "uploading" : ""}`}
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 16l-4-4-4 4" />
                                    <path d="M12 12v8" />
                                    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                                </svg>
                            </div>

                            <p className="drop-zone-title">Drag & drop your file here</p>
                            <p className="drop-zone-subtitle">or browse from your device</p>

                            <button
                                className="browse-btn"
                                type="button"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                Browse Files
                            </button>

                            <input
                                ref={fileInputRef}
                                className="hidden-file-input"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileSelect}
                            />

                            <p className="upload-hint">
                                Your data stays private in this demo environment.
                            </p>
                        </div>
                    </div>
                )}

                {file && (
                    <div className="uploaded-file">
                        <div className="file-info">
                            <div className="success-icon-wrap">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <div className="file-details">
                                <div className="file-name">{file.name}</div>
                                <div className="file-size">
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>

                        <button className="remove-btn" onClick={removeFile}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {file && (
                <div className="process-btn-wrapper">
                    <button className="process-btn" type="button">
                        Process File
                    </button>
                </div>
            )}
        </div>
    );
}
