import React, { useState } from "react";
import { Download, CheckCircle, X, Loader, AlertCircle } from "lucide-react";
import { parseExcelFile } from "../../utils/excelParser";

import "./BusinessDataUpload.css";

export default function BusinessDataUpload({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

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

        setUploadedFile(file);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress("");
    };

    const handleFileInputChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress("");
    };

    const UploadCloudIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    );

    const handleProcessTemplate = async () => {
        if (!uploadedFile) {
            alert("Please select a file first");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            // Step 1: Parse Excel
            setUploadProgress("📊 Parsing Excel file...");
            console.log("📊 Starting Excel parsing...");

            const parsedData = await parseExcelFile(uploadedFile);

            console.log("✅ Parsed data:", {
                products: parsedData.products.length,
                cashFlow: parsedData.cashFlow.length,
                pricingScenarios: parsedData.pricingScenarios.length,
                fixedCost: parsedData.fixedCost
            });

            // Validate parsed data
            if (!parsedData.products || parsedData.products.length === 0) {
                throw new Error("No products found in the Excel file. Please check the Cost-Volume-Profit sheet.");
            }

            if (!parsedData.cashFlow || parsedData.cashFlow.length === 0) {
                throw new Error("No cash flow data found. Please check the Cash Flow sheet.");
            }

            setUploadProgress(`✅ Parsed successfully: ${parsedData.products.length} products, ${parsedData.cashFlow.length} cash flow entries`);

            // Step 2: Check authentication
            setUploadProgress("🔐 Checking authentication...");
            const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

            if (!loggedUser || !loggedUser.username) {
                throw new Error("User not authenticated. Please log in again.");
            }

            // Step 3: Prepare upload
            setUploadProgress("📦 Preparing data for upload...");
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("parsedData", JSON.stringify(parsedData));
            formData.append("username", loggedUser.username);

            console.log("📤 Uploading to backend for user:", loggedUser.username);

            // Step 4: Upload to backend
            setUploadProgress("⬆️ Uploading to server...");
            const response = await fetch("http://localhost:5001/api/business-data/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log("✅ Upload successful:", result);
                setUploadSuccess(true);
                setUploadError(null);
                setUploadProgress("✅ Upload completed successfully!");

                // Call parent callback if provided
                if (onUploadSuccess) {
                    onUploadSuccess(result.data);
                }
            } else {
                throw new Error(result.msg || "Upload failed");
            }

        } catch (error) {
            console.error("🔥 Upload error:", error);
            setUploadError(error.message || "An error occurred during upload");
            setUploadSuccess(false);
            setUploadProgress("");
        } finally {
            setIsUploading(false);
        }
    };

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
                            link.href = '/assets/Haseeb-Business-Template.xlsx';
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
                                className="cloud-icon-wrap"
                            >
                                <UploadCloudIcon />
                            </div>

                            <p className="drop-zone-title">Select a file to upload</p>
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
                            <button
                                onClick={removeFile}
                                className="remove-btn"
                                disabled={isUploading}
                            >
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

                {/* Progress Message */}
                {uploadProgress && (
                    <div className="progress-message">
                        {isUploading && <Loader className="progress-spinner" size={20} />}
                        <span className="progress-text">{uploadProgress}</span>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div className="error-message">
                        <AlertCircle size={20} className="error-icon" />
                        <div className="error-content">
                            <p className="error-title">Upload Failed</p>
                            <p className="error-description">{uploadError}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {uploadSuccess && (
                    <div className="success-message">
                        <CheckCircle size={20} className="success-icon-msg" />
                        <span className="success-text">
                            Data uploaded successfully! Your business data is now ready for analysis.
                        </span>
                    </div>
                )}

                {uploadedFile && !uploadSuccess && (
                    <div className="process-btn-wrapper">
                        <button
                            className={`process-btn ${isUploading ? 'processing' : ''}`}
                            onClick={handleProcessTemplate}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader className="btn-spinner" size={18} />
                                    Processing...
                                </>
                            ) : (
                                "Process Template"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}