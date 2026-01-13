import React, { useState } from 'react'
import { TextField, Button, Paper, Typography, MenuItem } from '@mui/material'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/auth/register', { name, email, password, role })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data || err.message)
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 480, margin: '40px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Register</Typography>
      <form onSubmit={submit}>
        <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} />
        <TextField select fullWidth label="Role" value={role} onChange={e => setRole(e.target.value)} sx={{ mb: 2 }}>
          <MenuItem value="STUDENT">Student</MenuItem>
          <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
        </TextField>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Button type="submit" variant="contained">Create account</Button>
      </form>
    </Paper>
  )
}
