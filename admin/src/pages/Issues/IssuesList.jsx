import { useState, useEffect } from 'react';
import {Table, TableBody, TableCell,TableContainer,TableHead,TableRow,Paper,Typography,Chip,IconButton,Box,Button, TextField, MenuItem, InputAdornment, Card, CardContent} from'@mui/material';
import { Visibility as ViewIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useSnackbar } from 'notistack'; // Changed this line
import IssueDetailsDialog from '../../components/IssueDetails/IssueDetailsDialog';

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!socket) return; // Add this check

    fetchIssues();

    // Listen for socket events
    socket.on('issueUpdate', (data) => {
      console.log('Received issue update:', data);
      switch (data.type) {
        case 'NEW_ISSUE':
          setIssues(prev => [data.issue, ...prev]);
          enqueueSnackbar('New issue reported!', {
            variant: 'info',
            action: (key) => (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => handleViewNewIssue(data.issue._id)}
              >
                View
              </Button>
            )
          });
          break;
        case 'STATUS_UPDATE':
          setIssues(prev => prev.map(issue => 
            issue._id === data.issue._id ? data.issue : issue
          ));
          enqueueSnackbar(`Issue status updated to ${data.issue.status}`, {
            variant: 'info'
          });
          break;
        default:
          break;
      }
    });

    return () => {
      if (socket) {  // Add this check
        socket.off('issueUpdate');
      }
    };
  }, [socket, enqueueSnackbar]); // Add socket to dependency array

  const handleViewNewIssue = (issueId) => {
    // Scroll to the new issue or open issue details
    const element = document.getElementById(`issue-${issueId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.style.backgroundColor = '#f0f7ff';
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 2000);
    }
  };

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/issues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in_progress': return 'warning';
      case 'pending_verification': return 'default';
      case 'verified': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
  };

  const handleStatusUpdate = (updatedIssue) => {
    console.log('Updating issue:', updatedIssue);
    setIssues(prev => prev.map(issue => 
      issue._id === updatedIssue._id ? updatedIssue : issue
    ));
    enqueueSnackbar(`Issue status updated to ${updatedIssue.status}`, { 
      variant: 'success' 
    });
  };

  const filterIssues = () => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
                          issue.user.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || issue.status === filter;
      return matchesSearch && matchesFilter;
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card elevation={0} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h5" fontWeight={600}>
              Reported Issues
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search issues..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ width: 250 }}
              />
              <TextField
                select
                size="small"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ width: 150 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending_verification">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterIssues().map((issue) => (
                  <TableRow 
                    key={issue._id}
                    id={`issue-${issue._id}`}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{issue.title}</TableCell>
                    <TableCell>{issue.user.fullName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.priority}
                        size="small"
                        color={issue.priority.toLowerCase() === 'high' ? 'error' : 'default'}
                        sx={{ minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(issue.status)}
                        sx={{ minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleViewIssue(issue)}
                        sx={{ color: 'primary.main' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <IssueDetailsDialog 
        issue={selectedIssue}
        open={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </Box>
  );
}
