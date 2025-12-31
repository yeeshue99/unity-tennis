import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/contact")({
  component: contact,
})


function contact() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contact</h1>
      <p>Have questions? Get in touch with us at contact@unitytennis.com or call us at (123) 456-7890.</p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default contact;
