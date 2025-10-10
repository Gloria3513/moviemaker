import { useState, useEffect } from 'react';
import { getFiles, deleteFile, getFileUrl } from '../services/api';

const FileLibrary = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await getFiles();
      setFiles(fileList);
    } catch (err) {
      setError('파일을 불러오는데 실패했습니다.');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDeleteFile = async (filename) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeletingFile(filename);
      await deleteFile(filename);
      await fetchFiles();
    } catch (err) {
      alert('파일 삭제에 실패했습니다.');
      console.error('Error deleting file:', err);
    } finally {
      setDeletingFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const videoFormats = ['mp4', 'avi', 'mov', 'wmv'];
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (videoFormats.includes(ext)) return 'video';
    if (imageFormats.includes(ext)) return 'image';
    return 'unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">파일을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center p-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">업로드된 파일이 없습니다.</p>
        <p className="text-sm text-gray-500">첫 번째 파일을 업로드해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const fileType = getFileType(file.filename);
          const fileUrl = getFileUrl(file.filename);
          
          return (
            <div key={file.filename} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* 미리보기 영역 */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {fileType === 'video' ? (
                  <video
                    src={fileUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : fileType === 'image' ? (
                  <img
                    src={fileUrl}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 파일 정보 */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>크기: {formatFileSize(file.size)}</p>
                  <p>업로드: {formatDate(file.uploadedAt)}</p>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      fileType === 'video' ? 'bg-blue-100 text-blue-800' :
                      fileType === 'image' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fileType === 'video' ? '동영상' : fileType === 'image' ? '이미지' : '파일'}
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-4 flex space-x-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    보기
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.filename)}
                    disabled={deletingFile === file.filename}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingFile === file.filename ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      '삭제'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileLibrary;