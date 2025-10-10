import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    setLoading(true);
    
    // 임시 사용자 정보 생성
    const testUser = {
      uid: 'test-user-123',
      displayName: '테스트 사용자',
      email: 'test@example.com',
      photoURL: 'https://via.placeholder.com/40'
    };

    // 로컬 스토리지에 임시 저장
    localStorage.setItem('testUser', JSON.stringify(testUser));
    
    setTimeout(() => {
      setLoading(false);
      navigate('/');
      window.location.reload(); // 상태 업데이트를 위해 새로고침
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Movie Maker에 오신 것을 환영합니다
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Firebase 설정 전까지 테스트 로그인을 사용하세요
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  테스트 로그인 (Firebase 설정 전)
                </>
              )}
            </button>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">Firebase 설정이 완료되면:</p>
              <button
                disabled
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인 (설정 필요)
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Firebase 설정이 필요합니다!</strong><br/>
                    실제 Google 로그인을 사용하려면 .env 파일에 Firebase 설정값을 입력해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;