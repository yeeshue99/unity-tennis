// Updated Netlify Edge Function for tournament players routes
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method } = req;
  const db = await connectToDatabase();

  if (method === "GET" && req.url.pathname === "/tournament-players") {
    const tournamentPlayers = await db.query("SELECT * FROM tournament_players");
    return new Response(JSON.stringify(tournamentPlayers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    const data = await req.json();
    const { tournament_id, player_ids } = data;

    if (!tournament_id || !player_ids) {
      return new Response(JSON.stringify({ error: "tournament_id and player_ids are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const queries = player_ids.map(player_id =>
        db.query(
          "INSERT INTO tournament_players (tournament_id, player_id) VALUES (?, ?)",
          [tournament_id, player_id]
        )
      );
      await Promise.all(queries);

      return new Response(JSON.stringify({ message: "Players added to tournament successfully" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to add players to tournament" }), {
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
  path: ["/tournament-players", "/tournament_players"],
};