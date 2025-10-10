import { useState, useEffect } from 'react';
import { 
  getFiles, 
  getVideoInfo, 
  trimVideo, 
  concatVideos, 
  convertVideo, 
  applyVideoFilter,
  getOutputFiles,
  getFileUrl,
  getOutputUrl,
  deleteOutputFile
} from '../services/api';

const VideoEditor = () => {
  const [files, setFiles] = useState([]);
  const [outputFiles, setOutputFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('trim');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // 트림 상태
  const [trimSettings, setTrimSettings] = useState({
    startTime: 0,
    endTime: 10
  });

  // 합치기 상태
  const [concatSettings, setConcatSettings] = useState({
    selectedFiles: []
  });

  // 변환 상태
  const [convertSettings, setConvertSettings] = useState({
    format: 'mp4',
    quality: 'medium'
  });

  // 필터 상태
  const [filterSettings, setFilterSettings] = useState({
    brightness: 0,
    contrast: 1,
    saturation: 1
  });

  useEffect(() => {
    fetchFiles();
    fetchOutputFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFiles = async () => {
    try {
      const fileList = await getFiles();
      const videoFiles = fileList.filter(file => {
        const ext = file.filename.split('.').pop().toLowerCase();
        return ['mp4', 'avi', 'mov', 'wmv'].includes(ext);
      });
      setFiles(videoFiles);
    } catch {
      showNotification('파일을 불러오는데 실패했습니다.', 'error');
    }
  };

  const fetchOutputFiles = async () => {
    try {
      const outputList = await getOutputFiles();
      setOutputFiles(outputList);
    } catch {
      console.error('Error fetching output files');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    try {
      const info = await getVideoInfo(file.filename);
      setVideoInfo(info);
      setTrimSettings({
        startTime: 0,
        endTime: Math.min(10, Math.floor(info.duration))
      });
    } catch {
      showNotification('영상 정보를 가져오는데 실패했습니다.', 'error');
      setVideoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrim = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const result = await trimVideo(
        selectedFile.filename,
        trimSettings.startTime,
        trimSettings.endTime
      );
      showNotification(`영상이 성공적으로 잘렸습니다: ${result.outputFile}`);
      fetchOutputFiles();
    } catch {
      showNotification('영상 자르기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConcat = async () => {
    if (concatSettings.selectedFiles.length < 2) {
      showNotification('최소 2개의 파일을 선택해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await concatVideos(concatSettings.selectedFiles);
      showNotification(`영상이 성공적으로 합쳐졌습니다: ${result.outputFile}`);
      fetchOutputFiles();
    } catch {
      showNotification('영상 합치기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await convertVideo(
        selectedFile.filename,
        convertSettings.format,
        convertSettings.quality
      );
      showNotification(`영상이 성공적으로 변환되었습니다: ${result.outputFile}`);
      fetchOutputFiles();
    } catch {
      showNotification('영상 변환에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await applyVideoFilter(selectedFile.filename, filterSettings);
      showNotification(`필터가 성공적으로 적용되었습니다: ${result.outputFile}`);
      fetchOutputFiles();
    } catch {
      showNotification('필터 적용에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutput = async (filename) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      await deleteOutputFile(filename);
      showNotification('파일이 삭제되었습니다.');
      fetchOutputFiles();
    } catch {
      showNotification('파일 삭제에 실패했습니다.', 'error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* File Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">영상 선택</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">업로드된 영상 파일이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.filename}
                onClick={() => handleFileSelect(file)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedFile?.filename === file.filename
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <video
                  src={getFileUrl(file.filename)}
                  className="w-full h-32 object-cover rounded mb-2"
                  preload="metadata"
                />
                <p className="font-medium truncate">{file.filename}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Info */}
      {selectedFile && videoInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">영상 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">재생 시간</p>
              <p className="font-medium">{formatTime(videoInfo.duration)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">해상도</p>
              <p className="font-medium">
                {videoInfo.video ? `${videoInfo.video.width}x${videoInfo.video.height}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">포맷</p>
              <p className="font-medium">{videoInfo.format}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">파일 크기</p>
              <p className="font-medium">{formatFileSize(videoInfo.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {selectedFile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">미리보기</h3>
          <video
            src={getFileUrl(selectedFile.filename)}
            controls
            className="w-full max-w-2xl mx-auto rounded-lg"
          />
        </div>
      )}

      {/* Editing Tools */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'trim', name: '자르기', icon: '✂️' },
              { id: 'concat', name: '합치기', icon: '🔗' },
              { id: 'convert', name: '변환', icon: '🔄' },
              { id: 'filter', name: '필터', icon: '🎨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Trim Tab */}
          {activeTab === 'trim' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">영상 자르기</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간 (초)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={videoInfo?.duration || 0}
                    value={trimSettings.startTime}
                    onChange={(e) => setTrimSettings(prev => ({
                      ...prev,
                      startTime: Number(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    끝 시간 (초)
                  </label>
                  <input
                    type="number"
                    min={trimSettings.startTime}
                    max={videoInfo?.duration || 0}
                    value={trimSettings.endTime}
                    onChange={(e) => setTrimSettings(prev => ({
                      ...prev,
                      endTime: Number(e.target.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={handleTrim}
                disabled={!selectedFile || loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '영상 자르기'}
              </button>
            </div>
          )}

          {/* Concat Tab */}
          {activeTab === 'concat' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">영상 합치기</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">합칠 영상들을 선택하세요 (순서대로 합쳐집니다)</p>
                {files.map((file) => (
                  <label key={file.filename} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={concatSettings.selectedFiles.includes(file.filename)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConcatSettings(prev => ({
                            selectedFiles: [...prev.selectedFiles, file.filename]
                          }));
                        } else {
                          setConcatSettings(prev => ({
                            selectedFiles: prev.selectedFiles.filter(f => f !== file.filename)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{file.filename}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleConcat}
                disabled={concatSettings.selectedFiles.length < 2 || loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '영상 합치기'}
              </button>
            </div>
          )}

          {/* Convert Tab */}
          {activeTab === 'convert' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">포맷 변환</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    출력 포맷
                  </label>
                  <select
                    value={convertSettings.format}
                    onChange={(e) => setConvertSettings(prev => ({
                      ...prev,
                      format: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="wmv">WMV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    품질
                  </label>
                  <select
                    value={convertSettings.quality}
                    onChange={(e) => setConvertSettings(prev => ({
                      ...prev,
                      quality: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleConvert}
                disabled={!selectedFile || loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '포맷 변환'}
              </button>
            </div>
          )}

          {/* Filter Tab */}
          {activeTab === 'filter' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">영상 필터</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    밝기: {filterSettings.brightness}
                  </label>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={filterSettings.brightness}
                    onChange={(e) => setFilterSettings(prev => ({
                      ...prev,
                      brightness: Number(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대비: {filterSettings.contrast}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={filterSettings.contrast}
                    onChange={(e) => setFilterSettings(prev => ({
                      ...prev,
                      contrast: Number(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    채도: {filterSettings.saturation}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={filterSettings.saturation}
                    onChange={(e) => setFilterSettings(prev => ({
                      ...prev,
                      saturation: Number(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
              <button
                onClick={handleFilter}
                disabled={!selectedFile || loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '필터 적용'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Output Files */}
      {outputFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">편집된 영상들</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputFiles.map((file) => (
              <div key={file.filename} className="border rounded-lg p-4">
                <video
                  src={getOutputUrl(file.filename)}
                  className="w-full h-32 object-cover rounded mb-2"
                  controls
                  preload="metadata"
                />
                <p className="font-medium truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <div className="mt-2 flex space-x-2">
                  <a
                    href={getOutputUrl(file.filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    다운로드
                  </a>
                  <button
                    onClick={() => handleDeleteOutput(file.filename)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEditor;