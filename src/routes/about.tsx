import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/about")({
  component: about,
})


function about() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>About Us</h1>
      <p>Welcome to UniTY Tennis! We are dedicated to helping players of all levels improve their game and enjoy the sport of tennis.</p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default about;
