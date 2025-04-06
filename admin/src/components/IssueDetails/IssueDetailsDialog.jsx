import { 
  Dialog, DialogContent, DialogTitle, Grid, Typography, Chip, IconButton, 
  Box, Button, MenuItem, Select, FormControl, InputLabel, TextField,
  Stepper, Step, StepLabel, Paper, Divider, Card, CardContent, Alert, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import Map from '../Map/Map';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

export default function IssueDetailsDialog({ issue, open, onClose, onStatusUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    if (open && issue) {
      setSelectedStatus(issue.status);
      setNotes('');
    }
  }, [open, issue]);

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'pending_verification': ['verified', 'rejected'],
      'verified': ['in_progress'],
      'in_progress': ['resolved'],
      'resolved': [],
      'rejected': []
    };

    return statusFlow[currentStatus] || [];
  };

  const isStatusFinal = (status) => {
    return ['resolved', 'rejected'].includes(status);
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === issue.status) return;

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/issues/${issue._id}/status`,
        {
          status: selectedStatus,
          notes: notes || `Status updated to ${selectedStatus}`
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      onStatusUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Status update failed:', error);
      // Show error notification
    }
  };

  const renderLocation = () => {
    if (!issue?.location?.latitude || !issue?.location?.longitude) {
      return (
        <Typography color="text.secondary">
          Location data not available
        </Typography>
      );
    }

    const center = {
      lat: issue.location.latitude,
      lng: issue.location.longitude
    };

    return (
      <>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Coordinates: {issue.location.latitude}, {issue.location.longitude}
        </Typography>
        <Map 
          center={center}
          marker={true}
          zoom={15}
        />
      </>
    );
  };

  if (!issue) return null;

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending_verification': return 0;
      case 'verified': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
      case 'rejected': return -1; // Special case for rejected
      default: return 0;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle>
        Issue Details
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Left Panel - Issue Details */}
          <Grid item xs={12} md={7} sx={{ p: 3, borderRight: 1, borderColor: 'divider' }}>
            {/* Header with Title and Priority */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>{issue.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={issue.priority} 
                  color={issue.priority.toLowerCase() === 'high' ? 'error' : 'default'} 
                  size="small" 
                />
                <Typography variant="body2" color="textSecondary">
                  Reported on {new Date(issue.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            {/* Issue Image */}
            {issue.imageUrl && (
              <Box sx={{ mb: 3 }}>
                <img 
                  src={issue.imageUrl} 
                  alt="Issue" 
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px',
                    maxHeight: '300px',
                    objectFit: 'cover'
                  }} 
                />
              </Box>
            )}

            {/* Description */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {issue.description}
              </Typography>
            </Paper>

            {/* Reporter Info */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}></Box>
                <PersonIcon color="primary" />
                <Typography variant="h6">Reporter</Typography>
              <Typography variant="body1">{issue.user.fullName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {issue.user.email}
              </Typography>
              
            </Paper>

            {/* Location Info */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                {renderLocation()}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Verification and Status */}
          <Grid item xs={12} md={5} sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Issue Status</Typography>
              {issue?.status === 'rejected' ? (
                <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mt: 2 }}>
                  <Typography color="error.dark">
                    This issue has been rejected
                  </Typography>
                  {issue?.verificationNotes && (
                    <Typography variant="body2" color="error.dark" mt={1}>
                      Reason: {issue.verificationNotes}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Stepper 
                  activeStep={getStatusStep(issue?.status)} 
                  orientation="vertical"
                  sx={{
                    '& .Mui-disabled': {
                      // Gray out steps after rejection
                      ...(issue?.status === 'rejected' && {
                        '& .MuiStepIcon-root': { color: 'action.disabled' },
                        '& .MuiStepLabel-label': { color: 'text.disabled' }
                      })
                    }
                  }}
                >
                  <Step>
                    <StepLabel>Pending Verification</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Verified</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>In Progress</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Resolved</StepLabel>
                  </Step>
                </Stepper>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />
            
            {/* Status Update Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Status: {issue?.status?.replace('_', ' ')}
              </Typography>
              
              {isStatusFinal(issue?.status) ? (
                <Alert 
                  severity={issue?.status === 'resolved' ? 'success' : 'error'}
                  sx={{ 
                    mt: 1,
                    '& .MuiAlert-icon': {
                      color: 'inherit'
                    }
                  }}
                >
                  This issue has been {issue?.status}.
                </Alert>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={!getAvailableStatuses(issue?.status).length}
                    >
                      {getAvailableStatuses(issue?.status).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Update Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!getAvailableStatuses(issue?.status).length}
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!isStatusFinal(issue?.status) && (
          <Button
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || selectedStatus === issue?.status || !notes}
            color="primary"
          >
            Update Status
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
