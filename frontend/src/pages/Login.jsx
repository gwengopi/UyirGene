import React, { useState, useContext } from 'react'
import { TextField, Button, Paper, Typography } from '@mui/material'
import api from '../api'
import { AuthContext } from '../App'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const basic = 'Basic ' + btoa(email + ':' + password)
    try {
      // test credentials
      const res = await api.get('/api/auth/me', { headers: { Authorization: basic } })
      if (res.status === 200) {
        login(basic)
        navigate('/courses')
      }
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 480, margin: '40px auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
      <form onSubmit={submit}>
        <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} />
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Button type="submit" variant="contained">Sign in</Button>
      </form>
    </Paper>
  )
}