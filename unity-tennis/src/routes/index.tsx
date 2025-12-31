import { Container, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/")({
  component: index,
})

function index() {
  return (
    <>
      <Container style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Looking to improve your tennis skills? You've come to the right place!
        </Typography>
        <Typography variant="body1">
          Our experienced coaches are here to help you master the game, whether you're a beginner or an advanced player.
        </Typography>
      </Container>
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default index;
