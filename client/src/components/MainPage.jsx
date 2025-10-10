import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import FileLibrary from './FileLibrary';
import VideoEditor from './VideoEditor';

const MainPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshLibrary, setRefreshLibrary] = useState(0);
  const [notification, setNotification] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUploadSuccess = (result) => {
    setNotification({
      type: 'success',
      message: `파일 "${result.file.originalname}"이 성공적으로 업로드되었습니다.`
    });
    setRefreshLibrary(prev => prev + 1);
    setActiveTab('library');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadError = (error) => {
    setNotification({
      type: 'error',
      message: error
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Movie Maker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.photoURL || 'https://via.placeholder.com/32'}
                  alt={user?.displayName || 'User'}
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

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
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">⭐</div>
              <div>
                <h2 className="text-3xl font-bold">
                  안녕하세요, {user?.displayName}님! 🎬
                </h2>
                <p className="text-xl mt-2 opacity-90">
                  PD 별이가 여러분을 환영합니다! 
                </p>
                <p className="text-lg mt-1 opacity-80">
                  멋진 영상을 만들어보세요! ✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'upload'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  파일 업로드
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'library'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  파일 라이브러리
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'editor'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  영상 편집
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'upload' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">파일 업로드</h3>
                  <FileUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
                </div>
              )}

              {activeTab === 'library' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">파일 라이브러리</h3>
                  <FileLibrary refreshTrigger={refreshLibrary} />
                </div>
              )}

              {activeTab === 'editor' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">영상 편집</h3>
                  <VideoEditor />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;