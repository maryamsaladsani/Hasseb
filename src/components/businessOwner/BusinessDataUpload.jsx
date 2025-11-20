import React, { useState } from "react";
import "./BusinessDataUpload.css";
import { Download, CheckCircle, X } from "lucide-react";

export default function BusinessDataUpload({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (!validTypes.includes(file.type)) {
            alert("Please upload an Excel file (.xlsx or .xls)");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        setIsUploading(true);
        setTimeout(() => {
            setUploadedFile(file);
            setIsUploading(false);
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        }, 1200);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
    };

    const UploadCloudIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    );

    return (
        <>
            {/* Header */}
            <div className="upload-header">
                <h1>Import Your Business Data</h1>
                <p>Structure your business data using Haseeb's standardized Excel template for accurate financial analysis.</p>
            </div>

            {/* Download Template Card */}
            <div className="upload-card">
                <div className="card-content-center">
                    <div className="icon-wrapper download-icon">
                        <Download className="card-icon" />
                    </div>

                    <h2>Download Haseeb Template</h2>
                    <p>Pre-formatted Excel workbook with three sheets: Cash Flow, Cost-Volume-Profit, and Pricing Analysis.</p>

                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/templates/HaseebBusinessTemplate.xlsx';
                            link.download = 'Haseeb-Business-Template.xlsx';
                            link.click();
                        }}
                        className="download-btn"
                    >
                        Download Template
                    </button>
                </div>
            </div>

            {/* Upload Template Card */}
            <div className="upload-card">
                <div className="upload-card-header">
                    <h2>Upload Completed Template</h2>
                    <p className="upload-subtitle">Ensure all required fields are filled before uploading</p>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`file-drop-zone ${isDragging ? 'is-dragging' : ''}`}
                >
                    {!uploadedFile ? (
                        <div className="drop-zone-content">
                            <div
                                onClick={() => document.getElementById("file-input").click()}
                                className={`cloud-icon-wrap ${isUploading ? 'uploading' : ''}`}
                            >
                                <UploadCloudIcon />
                            </div>

                            <p className="drop-zone-title">
                                {isUploading ? "Processing file..." : "Select a file to upload"}
                            </p>
                            <p className="drop-zone-subtitle">
                                or drag and drop your completed template here
                            </p>

                            <button
                                onClick={() => document.getElementById("file-input").click()}
                                className="browse-btn"
                            >
                                Browse Files
                            </button>

                            <p className="upload-hint">
                                Accepted formats: .xlsx, .xls — Maximum size: 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="uploaded-file">
                            <div className="file-info">
                                <div className="success-icon-wrap">
                                    <CheckCircle className="success-icon" />
                                </div>
                                <div className="file-details">
                                    <p className="file-name">{uploadedFile.name}</p>
                                    <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={removeFile} className="remove-btn">
                                <X className="remove-icon" />
                            </button>
                        </div>
                    )}

                    <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileInputChange}
                        className="hidden-file-input"
                    />
                </div>

                {uploadedFile && (
                    <div className="process-btn-wrapper">
                        <button className="process-btn">
                            Process Template
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}