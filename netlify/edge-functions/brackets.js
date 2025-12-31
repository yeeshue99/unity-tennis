// Updated Netlify Edge Function for brackets routes
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method } = req;
  const db = await connectToDatabase();

  if (method === "GET") {
    const brackets = await db.query("SELECT * FROM brackets");
    return new Response(JSON.stringify(brackets), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    const data = await req.json();
    const { tournament_id, name } = data;

    if (!tournament_id || !name) {
      return new Response(JSON.stringify({ error: "tournament_id and name are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const result = await db.query(
        "INSERT INTO brackets (tournament_id, name) VALUES (?, ?)",
        [tournament_id, name]
      );
      return new Response(
        JSON.stringify({ id: result.insertId, message: "Bracket created successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to create bracket" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  });
}

export const config = {
  path: ["/brackets"],
};