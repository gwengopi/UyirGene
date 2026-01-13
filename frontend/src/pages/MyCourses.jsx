import React, { useEffect, useState, useContext } from 'react'
import api from '../api'
import { Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function MyCourses(){
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth?.token) { navigate('/login'); return }
    api.get('/api/courses/enrolled').then(r => setCourses(r.data)).catch(e => setError('Failed to load enrolled courses'))
  }, [auth, navigate])

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>My Courses</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        {courses.map(c => (
          <Grid item key={c.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.title}</Typography>
                <Typography variant="body2">{c.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/courses/${c.id}`}>Open</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}
