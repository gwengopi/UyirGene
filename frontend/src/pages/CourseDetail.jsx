import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { Typography, List, ListItem, ListItemText, Button, TextField } from '@mui/material'

export default function CourseDetail(){
  const { id } = useParams()
  const [videos, setVideos] = useState([])
  const [error, setError] = useState(null)
  const [pos, setPos] = useState({})

  useEffect(() => {
    api.get(`/api/courses/${id}/videos`).then(r => setVideos(r.data)).catch(e => setError('Failed to load videos: ' + (e.response?.data || e.message)))
  }, [id])

  const updateProgress = async (videoId) => {
    try {
      await api.post(`/api/videos/${videoId}/progress`, { lastPositionSeconds: Number(pos[videoId] || 0) })
      alert('Progress updated')
    } catch (e) {
      alert('Failed to update: ' + (e.response?.data || e.message))
    }
  }

  const downloadCert = () => {
    // open certificate URL in new tab, using auth header from localStorage
    const token = localStorage.getItem('uyir_auth')
    window.open(`/api/courses/${id}/certificate`, '_blank')
  }

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>Course Videos</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {videos.map(v => (
          <ListItem key={v.id} sx={{ display: 'block' }}>
            <ListItemText primary={v.title} secondary={`Duration: ${v.durationSeconds || 'N/A'}s`} />
            <TextField label="Last pos (s)" size="small" value={pos[v.id] || ''} onChange={e => setPos({...pos, [v.id]: e.target.value})} sx={{ mr: 1 }} />
            <Button onClick={() => updateProgress(v.id)}>Update</Button>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" sx={{ mt: 2 }} onClick={downloadCert}>Download Certificate</Button>
    </div>
  )
}