import { BrowserRouter as Router } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes'
import { SocketProvider } from './context/SocketContext';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';

function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Load the font
    const loadFont = async () => {
      try {
        const font = new FontFace('Gilroy', `url(${process.env.PUBLIC_URL}/assets/fonts/Gilroy-Bold.ttf)`);
        await font.load();
        document.fonts.add(font);
        setFontLoaded(true);
      } catch (error) {
        console.error('Error loading font:', error);
        setFontLoaded(true); // Continue anyway if font fails
      }
    };
    loadFont();
  }, []);

  if (!fontLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <SnackbarProvider>
            <CssBaseline />
            <AppRoutes />
          </SnackbarProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
