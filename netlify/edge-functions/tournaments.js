// Updated Netlify Edge Function for tournaments routes
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method } = req;
  const db = await connectToDatabase();

  if (method === "GET") {
    const tournaments = await db.query(
      "SELECT * FROM tournaments WHERE status IN ('PLANNING', 'IN_PROGRESS')"
    );
    return new Response(JSON.stringify(tournaments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    const data = await req.json();
    const { name, start_date, end_date, format, status } = data;

    try {
      const result = await db.query(
        "INSERT INTO tournaments (name, start_date, end_date, format, status) VALUES (?, ?, ?, ?, ?)",
        [name, start_date, end_date, format, status]
      );
      return new Response(
        JSON.stringify({ id: result.insertId, message: "Tournament created successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to create tournament" }), {
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
  path: ["/tournaments"],
};