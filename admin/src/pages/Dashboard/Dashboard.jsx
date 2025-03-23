import React from "react";
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { 
  Card, CardContent,
   Stack
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
// import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { AreaChart, Area } from 'recharts';
import ReportIcon from '@mui/icons-material/Report';

const mockData = [
  { name: 'Potholes', count: 20 },
  { name: 'Streetlights', count: 15 },
  { name: 'Garbage', count: 30 },
  { name: 'Roads', count: 25 }
];

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                    Total Issues
                  </Typography>
                  <Typography variant="h4">90</Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" />
                    +12% this month
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'primary.lighter',
                  borderRadius: 2,
                  color: 'primary.main'
                }}>
                  <ReportIcon />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Similar cards for Pending and Resolved... */}

        {/* Chart */}
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Issues Timeline</Typography>
              <Box sx={{ height: 360, mt: 3 }}>
                <AreaChart width={800} height={300} data={mockData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}