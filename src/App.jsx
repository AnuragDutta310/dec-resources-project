import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Submit from './pages/Submit'
import Profile from './pages/Profile'
import Signup from './pages/auth/Signup'
import Login from './pages/auth/Login'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function WithNav({ children }) {
  return <><Navbar />{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WithNav><Home /></WithNav>} />
          <Route path="/browse" element={<WithNav><Browse /></WithNav>} />
          <Route path="/submit" element={<WithNav><Submit /></WithNav>} />
          <Route path="/profile" element={<WithNav><Profile /></WithNav>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}