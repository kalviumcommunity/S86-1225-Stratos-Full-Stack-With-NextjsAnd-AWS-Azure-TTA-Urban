"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type StorageProvider = "s3" | "blob";

interface UploadedFile {
  name: string;
  key: string;
  uploadedAt: Date;
  size: number;
  type: string;
}

export default function FileUploadDemo() {
  const [provider, setProvider] = useState<StorageProvider>("s3");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [progress, setProgress] = useState(0);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`,
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum 5MB`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    toast.success(`Selected: ${file.name}`);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get presigned URL
      const endpoint =
        provider === "s3"
          ? "/api/storage/s3/upload-url"
          : "/api/storage/blob/upload-url";

      const urlResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, key, blobName } = await urlResponse.json();
      setProgress(30);

      // Step 2: Upload file to presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
          ...(provider === "blob" && { "x-ms-blob-type": "BlockBlob" }),
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setProgress(100);

      // Add to uploaded files list
      const uploaded: UploadedFile = {
        name: selectedFile.name,
        key: key || blobName,
        uploadedAt: new Date(),
        size: selectedFile.size,
        type: selectedFile.type,
      };

      setUploadedFiles((prev) => [uploaded, ...prev]);
      toast.success(`File uploaded successfully to ${provider.toUpperCase()}!`);

      // Reset
      setSelectedFile(null);
      setProgress(0);

      // Clear file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const endpoint =
        provider === "s3"
          ? "/api/storage/s3/download-url"
          : "/api/storage/blob/download-url";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [provider === "s3" ? "key" : "blobName"]: file.key,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const { downloadUrl } = await response.json();

      // Open in new tab
      window.open(downloadUrl, "_blank");
      toast.success("Download link generated!");
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Download error:", error);
      toast.error(error.message || "Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          ☁️ Cloud Storage Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Upload files securely using AWS S3 or Azure Blob Storage
        </p>

        {/* Provider Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Storage Provider
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setProvider("s3")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                provider === "s3"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📦 AWS S3
            </button>
            <button
              onClick={() => setProvider("blob")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                provider === "blob"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🔵 Azure Blob
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Upload File</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept={allowedTypes.join(",")}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                cursor-pointer"
              disabled={uploading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Max size: 5MB | Allowed: JPEG, PNG, PDF
            </p>
          </div>

          {selectedFile && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Selected File:
              </p>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB |{" "}
                {selectedFile.type}
              </p>
            </div>
          )}

          {progress > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium
              hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {uploading ? "Uploading..." : `Upload to ${provider.toUpperCase()}`}
          </button>
        </div>

        {/* Uploaded Files List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h2>

          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No files uploaded yet. Upload a file to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB |{" "}
                      {file.uploadedAt.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📥 Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
