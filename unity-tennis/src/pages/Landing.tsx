import { Container, Typography } from '@mui/material';

function Landing() {
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

export default Landing;
