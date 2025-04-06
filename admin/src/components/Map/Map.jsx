import React from 'react';
import { Box, Paper } from '@mui/material';

export default function Map({ center, zoom = 15 }) {
  // Use OpenStreetMap static image
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-0.01}%2C${center.lat-0.01}%2C${center.lng+0.01}%2C${center.lat+0.01}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <Paper elevation={0} sx={{ 
      borderRadius: 2, 
      overflow: 'hidden',
      height: 200 
    }}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        style={{ border: 0 }}
      />
    </Paper>
  );
}
