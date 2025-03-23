import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Divider,
  FormControlLabel,
  TextField,
  Button
} from '@mui/material';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoVerification: false,
    maxReportsPerUser: 10,
    requireImageEvidence: true,
  });

  const handleChange = (name) => (event) => {
    setSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Settings
      </Typography>

      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
              />
            }
            label="Email notifications for new reports"
          />
          <Box mt={2}>
            <Typography color="text.secondary" variant="body2">
              Receive email notifications when new issues are reported
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Verification Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoVerification}
                onChange={handleChange('autoVerification')}
              />
            }
            label="Enable AI-assisted auto verification"
          />
          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={
              <Switch
                checked={settings.requireImageEvidence}
                onChange={handleChange('requireImageEvidence')}
              />
            }
            label="Require image evidence for reports"
          />
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Limits
          </Typography>
          <Box sx={{ maxWidth: 300 }}>
            <TextField
              fullWidth
              type="number"
              label="Max reports per user"
              value={settings.maxReportsPerUser}
              onChange={handleChange('maxReportsPerUser')}
              sx={{ mb: 2 }}
            />
          </Box>

          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => console.log('Settings saved:', settings)}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
