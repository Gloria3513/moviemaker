import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Login from './components/Login';
import TestLogin from './components/TestLogin';
import MainPage from './components/MainPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test-login" element={<TestLogin />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/test-login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
