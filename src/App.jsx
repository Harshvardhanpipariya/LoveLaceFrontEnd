import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainer from './components/AuthContainer';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage.jsx'
import { ProtectedRoute, PublicRoute } from './routes.jsx';
import { Toaster } from 'react-hot-toast';
import NotesUploadPage from './components/NotesUploadPage.jsx';
import ChatSection from './components/ChatSection.jsx'
function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0A0A0A',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      <Router>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
          <Routes>

            <Route path="/login" element={
              <PublicRoute>
                <AuthContainer />
              </PublicRoute>
            } />

            <Route path="/signup" element={
              <PublicRoute>
                <AuthContainer />
              </PublicRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <LandingPage />} />

              <Route path="/notesupload" element={<NotesUploadPage />}></Route>

              <Route path="/chatsection" element={<ChatSection />}></Route>


            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>

    </>
  );
}

export default App;