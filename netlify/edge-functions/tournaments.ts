// Updated Netlify Edge Function for tournaments routes
import supabase from "../util/db.ts";
import headers from "../util/headers.ts";

export default async function handler(req: Request): Promise<Response> {
  const { method } = req;

  if (method === "GET") {
    try {
      const { data: tournaments, error } = await supabase
        .from("public.tournaments")
        .select()
        .in("status", ["PLANNING", "IN_PROGRESS"]);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(tournaments), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch tournaments" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  }

  if (method === "POST") {
    const data = await req.json();
    const { name, start_date, end_date, format, status } = data;

    try {
      const { error } = await supabase
        .from("public.tournaments")
        .insert({ name, start_date, end_date, format, status });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ message: "Tournament created successfully" }),
        {
          status: 201,
          headers: { ...headers, "Content-Type": "application/json" },
        }
      );
    } catch {
      return new Response(JSON.stringify({ error: "Failed to create tournament" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  });
}

export const config = {
  path: ["/api/tournaments"],
};