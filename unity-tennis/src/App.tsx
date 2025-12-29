import './App.css';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Routes, Route } from 'react-router-dom';
import AboutUs from './pages/AboutUs';
import Coaching from './pages/Coaching';
import Contact from './pages/Contact';
import LocalLeagues from './pages/LocalLeagues';
import Landing from './pages/Landing';

import Header from './components/Header';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    background: {
      default: '#FFF8E1', // Warm white color
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/local-leagues" element={<LocalLeagues />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
