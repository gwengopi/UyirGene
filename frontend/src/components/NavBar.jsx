import React, { useContext } from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { clearAuthHeader } from '../api'

export default function NavBar(){
  const { auth, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleLogout = () => { logout(); clearAuthHeader(); navigate('/login') }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Uyirgene
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/courses">Courses</Button>
          {auth?.token ? (
            <>
              <Button color="inherit" component={Link} to="/my-courses">My Courses</Button>
              <Button color="inherit" disabled sx={{ textTransform: 'none' }}>{auth.user?.email}</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}