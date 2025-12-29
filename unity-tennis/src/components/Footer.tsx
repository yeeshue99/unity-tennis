import { AppBar, Toolbar, Typography } from '@mui/material';

function Footer() {
  return (
    <AppBar position="fixed" style={{ top: 'auto', bottom: 0, backgroundColor: '#4CAF50' }}>
      <Toolbar style={{ justifyContent: 'center' }}>
        <Typography variant="body2" color="inherit">
          &copy; 2025 Tennis Coaching. All rights reserved.
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Footer;
