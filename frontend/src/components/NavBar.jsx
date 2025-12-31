import React, { useContext } from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function NavBar(){
  const { auth, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Uyirgene
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/courses">Courses</Button>
          {auth.token ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}