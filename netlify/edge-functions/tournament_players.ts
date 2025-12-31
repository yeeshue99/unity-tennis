// Updated Netlify Edge Function for tournament players routes
import supabase from "../util/db.ts";

export default async function handler(req: Request): Promise<Response> {
  const { method } = req;

  if (method === "GET" && new URL(req.url).pathname === "/tournament-players") {
    try {
      const { data: tournamentPlayers, error } = await supabase.from("tournament_players").select();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(tournamentPlayers), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch tournament players" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
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
      const { error } = await supabase.from("tournament_players").insert(
        player_ids.map((player_id: number) => ({ tournament_id, player_id }))
      );

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: "Players added to tournament successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
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
  path: "/tournament_players",
};