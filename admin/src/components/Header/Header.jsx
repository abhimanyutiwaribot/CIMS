import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Toolbar sx={{ height: 70 }}>
      <img 
              src="/assets/icon.png" 
              alt="Reparo" 
              style={{ 
                width: 115, 
                height: 115,
                objectFit: 'contain'
              }} 
            />

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          '& button': { transition: 'all 0.2s' }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            padding: '8px 16px',
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.light',
                color: 'primary.dark',
                fontWeight: 600,
                width: 40,
                height: 40,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: '0 0 0 2px #fff'
              }}
            >
              {admin?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {admin?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </Box>

          <IconButton 
            onClick={handleLogout}
            sx={{ 
              bgcolor: 'error.lighter',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light'
              }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
