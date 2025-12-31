// Updated Netlify Edge Function for managing bracket players
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method, url } = req;
  const db = await connectToDatabase();

  if (method === "POST" && url.pathname === "/bracket_players") {
    const data = await req.json();
    const { bracket_id, player_id } = data;

    if (!bracket_id || !player_id) {
      return new Response(JSON.stringify({ error: "bracket_id and player_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const result = await db.query(
        "INSERT INTO bracket_players (bracket_id, player_id) VALUES (?, ?)",
        [bracket_id, player_id]
      );
      return new Response(
        JSON.stringify({
          id: result.insertId,
          message: "Player added to bracket successfully",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to add player to bracket" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Updated DELETE method to delete by bracket_id and player_id
  if (method === "DELETE" && url.pathname === "/bracket_players") {
    const data = await req.json();
    const { bracket_id, player_id } = data;

    if (!bracket_id || !player_id) {
      return new Response(JSON.stringify({ error: "bracket_id and player_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await db.query(
        "DELETE FROM bracket_players WHERE bracket_id = ? AND player_id = ?",
        [bracket_id, player_id]
      );
      return new Response(
        JSON.stringify({ message: "Player removed from bracket successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to remove player from bracket" }), {
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
  path: ["/bracket_players", "/bracket_players/:id"],
};