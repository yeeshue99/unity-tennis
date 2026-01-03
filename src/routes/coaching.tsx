import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/coaching")({
  component: coaching,
})


function coaching() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Coaching</h1>
      <p>Our experienced coach offers personalized training sessions to help you reach your full potential on the court.</p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default coaching;
