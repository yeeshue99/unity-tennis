// Updated Netlify Edge Function for players routes
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method } = req;
  const db = await connectToDatabase();

  if (method === "GET") {
    const players = await db.query("SELECT * FROM players");
    return new Response(JSON.stringify(players), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    const data = await req.json();
    const { name, gender, phone_number } = data;

    if (!name || !gender || !phone_number) {
      return new Response(JSON.stringify({ error: "name, gender, and phone_number are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await db.query(
        "INSERT INTO players (name, gender, phone_number) VALUES (?, ?, ?)",
        [name, gender, phone_number]
      );
      return new Response(
        JSON.stringify({ message: "Player added successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to add player" }), {
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
  path: ["/players"],
};