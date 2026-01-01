// Updated Netlify Edge Function for players routes
import supabase from "../util/db.ts";

export default async function handler(req: Request): Promise<Response> {
  const { method } = req;

  if (method === "GET") {
    try {
      const { data: players, error } = await supabase.from("public.players").select();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(players), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch players" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
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
      const { error } = await supabase
        .from("players")
        .insert({ name, gender, phone_number });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: "Player added successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
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
  path: "/api/players",
};