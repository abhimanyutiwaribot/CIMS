import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useSnackbar } from 'notistack';  // Make sure this is imported

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();  // Add this hook

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const checkUserToken = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `http://192.168.0.194:5000/api/admin/user-token/${userId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (!response.data.hasToken) {
        enqueueSnackbar('User has no push token registered', { variant: 'warning' });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking user token:', error);
      return false;
    }
  };

  const sendTestNotification = async (userId) => {
    const hasToken = await checkUserToken(userId);
    if (!hasToken) return;

    try {
      console.log('Sending test notification to user:', userId); // Debug log
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://192.168.0.194:5000/api/admin/test-notification/${userId}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Notification response:', response.data);
      enqueueSnackbar('Test notification sent!', { variant: 'success' });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });
      
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to send test notification', 
        { variant: 'error' }
      );
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Card elevation={0}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Users
            </Typography>
            <TextField
              placeholder="Search users..."
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
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Reports</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user._id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.profilePic} alt={user.fullName} />
                        <Typography fontWeight={500}>{user.fullName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.reportCount || 0}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        startIcon={<NotificationsIcon />}
                        size="small"
                        onClick={() => sendTestNotification(user._id)}
                        variant="outlined"
                      >
                        Test Notification
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
