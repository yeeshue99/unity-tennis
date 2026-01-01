// Updated Netlify Edge Function for matchups routes
import supabase from "../util/db.ts";

export default async function handler(req: Request): Promise<Response> {
  const { method, url } = req;

  if (method === "GET" && new URL(url).pathname === "/api/matchups") {
    try {
      const { data: matchups, error } = await supabase.from("matchups").select();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(matchups), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch matchups" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (method === "GET" && new URL(url).pathname.startsWith("/api/brackets/")) {
    const bracketId = new URL(req.url).pathname.split("/")[3];
    const params = new URLSearchParams(new URL(req.url).search);
    const PENDING = params.get("PENDING");
    const PLANNING = params.get("PLANNING");
    const COMPLETED = params.get("COMPLETED");
    const ALL = params.get("ALL");

    let query = supabase.from("matchups").select().eq("bracket_id", bracketId);

    if (!ALL) {
      const conditions: string[] = [];
      if (PENDING) conditions.push("PENDING");
      if (PLANNING) conditions.push("PLANNING");
      if (COMPLETED) conditions.push("COMPLETED");

      if (conditions.length) {
        query = query.in("status", conditions);
      }
    }

    try {
      const { data: matchups, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(matchups), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to fetch matchups" }), {
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
  path: ["/api/matchups", "/api/brackets/:id/matchups"],
};