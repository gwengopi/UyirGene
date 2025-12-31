import React, { useEffect, useState } from 'react'
import api from '../api'
import { Card, CardContent, CardActions, Button, Typography, Grid } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Courses(){
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/courses').then(r => setCourses(r.data)).catch(e => setError('Failed to load courses'))
  }, [])

  const enroll = async (id) => {
    try {
      await api.post(`/api/courses/${id}/enroll`)
      alert('Enrolled')
    } catch (e) {
      alert('Failed to enroll: ' + (e.response?.data || e.message))
    }
  }

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>Courses</Typography>
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
                <Button size="small" onClick={() => enroll(c.id)}>Enroll</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}