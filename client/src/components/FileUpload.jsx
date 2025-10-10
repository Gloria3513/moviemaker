import { useState, useRef } from 'react';
import { uploadFile } from '../services/api';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif'
  ];

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!supportedFormats.includes(file.type)) {
      onUploadError?.('지원되지 않는 파일 형식입니다.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      onUploadError?.('파일 크기가 100MB를 초과합니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      onUploadSuccess?.(result);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error.message || '업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*,image/*"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">업로드 중...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                파일을 여기에 드롭하거나{' '}
                <button
                  onClick={openFileDialog}
                  className="text-indigo-600 hover:text-indigo-500 underline"
                >
                  찾아보기
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                최대 100MB까지 업로드 가능
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">지원 형식:</p>
              <p>동영상: MP4, AVI, MOV, WMV</p>
              <p>이미지: JPEG, PNG, GIF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;