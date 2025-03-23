import { 
  Dialog, DialogContent, DialogTitle, Grid, Typography, Chip, IconButton, 
  Box, Button, MenuItem, Select, FormControl, InputLabel, TextField,
  Stepper, Step, StepLabel, Paper, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import axios from 'axios';

const getAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'verified':
      return ['in_progress'];
    case 'in_progress':
      return ['resolved'];
    case 'resolved':
      return []; // No further status changes allowed
    case 'rejected':
      return []; // No status changes for rejected issues
    default:
      return [];
  }
};

export default function IssueDetailsDialog({ issue, open, onClose, onStatusUpdate }) {
  const [currentIssue, setCurrentIssue] = useState(issue);
  const [status, setStatus] = useState(issue?.status || 'pending_verification');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Update local state when issue prop changes
  useEffect(() => {
    setCurrentIssue(issue);
    setStatus(issue?.status || 'pending_verification');
  }, [issue]);

  const handleStatusChange = async (newStatus) => {
    if (!verificationNotes.trim()) {
      // Show error that notes are required
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `http://localhost:5000/api/admin/issues/${issue._id}/status`,
        { 
          status: newStatus,
          notes: verificationNotes 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCurrentIssue(response.data);
      setVerificationNotes(''); // Clear notes after update
      onStatusUpdate(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerification = async (isVerified) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:5000/api/admin/issues/${issue._id}/verify`,
        { 
          isVerified,
          verificationNotes 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state instead of closing dialog
      setCurrentIssue(response.data);
      onStatusUpdate(response.data);
      setVerificationNotes(''); // Clear notes after verification
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusSelect = () => (
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select
        value={currentIssue.status}
        label="Status"
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={updating || !getAvailableStatuses(currentIssue.status).length}
      >
        {getAvailableStatuses(currentIssue.status).map((status) => (
          <MenuItem key={status} value={status}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderStatusActions = () => {
    // Don't show verification or status updates if rejected
    if (currentIssue?.status === 'rejected') {
      return (
        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
          <Typography color="error.dark" variant="subtitle1" fontWeight={500}>
            Issue Rejected
          </Typography>
          <Typography color="error.dark" variant="body2" sx={{ mt: 1 }}>
            {currentIssue?.verificationNotes || 'No rejection reason provided'}
          </Typography>
        </Box>
      );
    }

    // Show verification section if not verified
    if (!currentIssue?.isVerified) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Verify Issue</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Verification Notes"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => handleVerification(true)}
              disabled={updating || !verificationNotes}
            >
              Verify Issue
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => handleVerification(false)}
              disabled={updating || !verificationNotes}
            >
              Reject Issue
            </Button>
          </Box>
        </Box>
      );
    }

    // Show status update section if verified with proper progression
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Update Status</Typography>
        {getAvailableStatuses(currentIssue.status).length > 0 ? (
          <>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Status Update Notes"
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              margin="normal"
              variant="outlined"
              required
            />
            {renderStatusSelect()}
          </>
        ) : (
          <Typography color="text.secondary">
            {currentIssue.status === 'resolved' 
              ? 'This issue has been resolved and cannot be modified further.'
              : 'No further status updates available for this issue.'}
          </Typography>
        )}
      </Box>
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
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h6">Issue Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
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
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon color="primary" />
                <Typography variant="h6">Location</Typography>
              </Box>
              <Typography variant="body2">
                Latitude: {issue.location.latitude}
                <br />
                Longitude: {issue.location.longitude}
              </Typography>
            </Paper>
          </Grid>

          {/* Right Panel - Verification and Status */}
          <Grid item xs={12} md={5} sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Issue Status</Typography>
              {currentIssue?.status === 'rejected' ? (
                <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mt: 2 }}>
                  <Typography color="error.dark">
                    This issue has been rejected
                  </Typography>
                  {currentIssue?.verificationNotes && (
                    <Typography variant="body2" color="error.dark" mt={1}>
                      Reason: {currentIssue.verificationNotes}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Stepper 
                  activeStep={getStatusStep(currentIssue?.status)} 
                  orientation="vertical"
                  sx={{
                    '& .Mui-disabled': {
                      // Gray out steps after rejection
                      ...(currentIssue?.status === 'rejected' && {
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
            
            {renderStatusActions()}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
