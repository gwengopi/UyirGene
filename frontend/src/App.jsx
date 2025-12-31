import React, { useState, createContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from '@mui/material'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'

export const AuthContext = createContext()

export default function App() {
  const [auth, setAuth] = useState(() => ({ token: localStorage.getItem('uyir_auth') }))

  const login = (token) => {
    localStorage.setItem('uyir_auth', token)
    setAuth({ token })
  }
  const logout = () => {
    localStorage.removeItem('uyir_auth')
    setAuth({ token: null })
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <NavBar />
      <Container sx={{ mt: 3 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/" element={<Navigate to="/courses" replace />} />
        </Routes>
      </Container>
    </AuthContext.Provider>
  )
}