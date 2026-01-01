// Updated Netlify Edge Function for managing bracket players
import supabase from "../util/db.ts";
import type { Config } from "@netlify/edge-functions";

export default async function handler(req: Request): Promise<Response> {
  const { method, url } = req;

  if (method === "POST" && new URL(url).pathname === "/bracket_players") {
    const data = await req.json();
    const { bracket_id, player_id } = data;

    if (!bracket_id || !player_id) {
      return new Response(JSON.stringify({ error: "bracket_id and player_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const { error } = await supabase
        .from("bracket_players")
        .insert({ bracket_id, player_id });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          message: "Player added to bracket successfully",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
      return new Response(JSON.stringify({ error: "Failed to add player to bracket" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (method === "DELETE" && new URL(url).pathname === "/bracket_players") {
    const data = await req.json();
    const { bracket_id, player_id } = data;

    if (!bracket_id || !player_id) {
      return new Response(JSON.stringify({ error: "bracket_id and player_id are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const { error } = await supabase
        .from("bracket_players")
        .delete()
        .match({ bracket_id, player_id });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: "Player removed from bracket successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
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

export const config: Config = {
  path: "/api/bracket_players",
};