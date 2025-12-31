// Updated Netlify Edge Function for the home route
export default async function handler(req, context) {
  return new Response("Welcome to the UniTY Tennis Backend!", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export const config = {
  path: ["/"],
};