import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar position="fixed" style={{ backgroundColor: '#4CAF50', width: '100%' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="home" component={RouterLink} to="/">
          <HomeIcon />
        </IconButton>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          UniTY Tennis
        </Typography>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem' }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ArrowBack />
          </IconButton>
        </div>
        <List style={{ width: 250 }}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/about" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="About Us" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/coaching" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Coaching" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/contact" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Contact" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/local-leagues" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Local Leagues" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;
