// Updated Netlify Edge Function for matchups routes
import { connectToDatabase } from "../utils/db";

export default async function handler(req, context) {
  const { method, url } = req;
  const db = await connectToDatabase();

  if (method === "GET" && url.pathname === "/matchups") {
    const matchups = await db.query("SELECT * FROM matchups");
    return new Response(JSON.stringify(matchups), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "GET" && url.pathname.startsWith("/brackets/")) {
    const bracketId = url.pathname.split("/")[2];
    const params = new URLSearchParams(url.search);
    const PENDING = params.get("PENDING");
    const PLANNING = params.get("PLANNING");
    const COMPLETED = params.get("COMPLETED");
    const ALL = params.get("ALL");

    let query = "SELECT * FROM matchups WHERE bracket_id = ?";
    const queryParams = [bracketId];

    if (!ALL) {
      const conditions = [];
      if (PENDING) conditions.push("status = 'PENDING'");
      if (PLANNING) conditions.push("status = 'PLANNING'");
      if (COMPLETED) conditions.push("status = 'COMPLETED'");
      if (conditions.length) query += ` AND (${conditions.join(" OR ")})`;
    }

    const matchups = await db.query(query, queryParams);
    return new Response(JSON.stringify(matchups), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  });
}

export const config = {
  path: ["/matchups", "/brackets/:id/matchups"],
};