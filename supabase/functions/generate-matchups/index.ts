import { createClient, corsHeaders } from 'npm:@supabase/supabase-js@2.27.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

interface Player {
  id: number
}
interface BracketPlayer {
  id: number
  player_id: number
  partner_id?: number
}
interface Matchup {
  bracket_id: number
  round?: number | null
  player1_id?: number | null
  player2_id?: number | null
  player1_partner_id?: number | null
  player2_partner_id?: number | null
  status: string
}
interface RequestBody {
  bracket_id: string
  format: string // e.g., 'single_elimination', 'round_robin', 'double_elimination'
}

function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function pairTeams(teams: any[]) {
  const pairs: any[] = []
  for (let i = 0; i < teams.length; i += 2) {
    const t1 = teams[i]
    const t2 = teams[i + 1] ?? null // bye if null
    pairs.push({ player1: t1, player2: t2 })
  }
  return pairs
}

function generateSingleElimination(teams: any[]) {
  const seeded = shuffle([...teams])
  // if odd, add bye (null)
  if (seeded.length % 2 === 1) seeded.push(null)
  const round1 = pairTeams(seeded)
  return { rounds: [round1] }
}

function generateRoundRobin(
  bracketId: number,
  players: BracketPlayer[],
): Matchup[][] {
  const list = [...players]
  const isOdd = list.length % 2 === 1
  if (isOdd) list.push({ id: 0, player_id: 0 }) // dummy bye player
  const shuffled = shuffle([...list])
  const rounds: Matchup[][] = []
  const n = shuffled.length
  console.log('Shuffled players for round robin:', shuffled)
  for (let r = 1; r < n; r++) {
    const matchups: Matchup[] = []
    for (let i = 0; i < n / 2; i++) {
      const t1 = shuffled[i]
      const t2 = shuffled[n - 1 - i]
      if (t1.partner_id) {
        matchups.push({
          bracket_id: bracketId,
          round: r,
          player1_id: t1.player_id,
          player2_id: t2.player_id,
          player1_partner_id: t1.partner_id,
          player2_partner_id: t2.partner_id,
          status: 'PENDING',
        })
      } else {
        matchups.push({
          bracket_id: bracketId,
          round: r,
          player1_id: t1.player_id,
          player2_id: t2.player_id,
          status: 'PENDING',
        })
      }
    }
    // rotate
    shuffled.splice(1, 0, shuffled.pop()!)
    rounds.push(matchups)
  }
  return rounds
}

function generateDoubleElimination(teams: any[]) {
  // For simplicity, generate initial single-elim bracket; full double-elim bracket generation is complex.
  return generateSingleElimination(teams)
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Received request to generate matchups')

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Only POST allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Parsing request body...')
    const body: RequestBody = await req.json()
    const { bracket_id, format } = body
    if (!bracket_id || !format) {
      return new Response(
        JSON.stringify({ error: 'bracket_id and format are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // if bracket_id is not a number, return error
    console.log('Validating bracket_id:', bracket_id)
    const bracketIdNum = Number(bracket_id)
    if (isNaN(bracketIdNum)) {
      return new Response(JSON.stringify({ error: 'Invalid bracket_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch teams for bracket
    console.log('Fetching teams for bracket_id:', bracketIdNum)
    const { data, error } = await supabase
      .from('bracket_players')
      .select('id, player_id, partner_id')
      .eq('bracket_id', bracketIdNum)
      .order('id', { ascending: true })

    if (error) {
      console.error('DB error', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch teams' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const teams = data ?? []

    let result
    console.log('Generating matchups for format:', format, 'with teams:', teams)
    switch (format) {
      case 'ROUND_ROBIN':
        result = generateRoundRobin(bracketIdNum, teams)
        break
      default:
        return new Response(JSON.stringify({ error: 'Unsupported format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    console.log('Generated matchups:', result)
    console.log('Inserting matchups into DB...')
    const { error: insertErr } = await supabase
      .from('matchups')
      .insert(result.flat())
      .select()

    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({
        status: 201,
        statusText: 'Created',
      }),
      { status: 201 },
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error', e: err }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
