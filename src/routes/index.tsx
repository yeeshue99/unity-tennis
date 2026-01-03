import { Button, Container, Typography } from '@mui/material';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute("/")({
  component: index,
})

function index() {
  return (
    <>
      <Container style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Looking to improve your tennis skills or get involved in your local tennis community? You've come to the right place!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link}
          to="/tournaments"
          style={{ marginTop: '1rem' }}
        >
          View Tournaments
        </Button>
      </Container>
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default index;
