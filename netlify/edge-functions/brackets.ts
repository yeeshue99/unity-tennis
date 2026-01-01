// Updated Netlify Edge Function for brackets routes
import supabase from "../util/db.ts";

export default async function handler(req: Request): Promise<Response> {
  const { method } = req;

  if (method === "GET") {
    try {
      const { data: brackets, error } = await supabase.from("brackets").select();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(brackets), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch brackets" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
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
      const { error } = await supabase
        .from("brackets")
        .insert({ tournament_id, name });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: "Bracket created successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
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
  path: ["/api/brackets"],
};