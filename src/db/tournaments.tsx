import { createSupabaseClient } from '@/db/db'
import { MatchupStatus } from './matchups'

export const fetchTournaments = async () => {
  const supabase = createSupabaseClient()
  const response = await supabase
    .from('tournaments')
    .select('id, name, status, current_round, start_date, end_date, format')

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }

  return response.data
}

export const startTournament = async (
  tournament_id: number,
  bracket_id: number,
) => {
  const supabase = createSupabaseClient()
  const tournamentResponse = await supabase
    .from('tournaments')
    .update({
      status: MatchupStatus.IN_PROGRESS,
      start_date: new Date().toISOString(),
    })
    .eq('id', tournament_id)
    .select()

  if (!tournamentResponse.status || tournamentResponse.error) {
    throw new Error('Network response was not ok')
  }

  const bracketsResponse = await supabase
    .from('brackets')
    .update({ status: MatchupStatus.IN_PROGRESS })
    .eq('tournament_id', tournament_id)
    .select()

  if (!bracketsResponse.status || bracketsResponse.error) {
    throw new Error('Network response was not ok')
  }

  const nextRoundResponse = await updateMatchupsForCurrentRound(
    bracket_id,
    tournamentResponse.data[0].current_round,
  )

  if (!nextRoundResponse) {
    throw new Error('Failed to activate next round')
  }

  return tournamentResponse.data
}

export const activateNextRound = async (
  tournament_id: number,
  bracket_id: number,
) => {
  const supabase = createSupabaseClient()

  const bracketResponse = await supabase
    .from('tournaments')
    .select('current_round')
    .eq('id', tournament_id)
    .single()

  if (!bracketResponse.status || bracketResponse.error) {
    throw new Error('Failed to fetch current round from tournament')
  }

  const tournament = bracketResponse.data as any
  const current_round = tournament.current_round + 1

  const updateResponse = await supabase
    .from('tournaments')
    .update({ current_round })
    .eq('id', tournament_id)

  if (!updateResponse.status || updateResponse.error) {
    throw new Error('Failed to update current round in tournament')
  }

  const response = await supabase
    .from('matchups')
    .update({ status: MatchupStatus.IN_PROGRESS })
    .eq('bracket_id', bracket_id)
    .eq('status', MatchupStatus.PENDING)
    .eq('round', current_round)

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }

  return response.data
}

export const updateMatchupsForCurrentRound = async (
  bracket_id: number,
  current_round: number,
) => {
  const supabase = createSupabaseClient()

  const response = await supabase
    .from('matchups')
    .update({ status: MatchupStatus.IN_PROGRESS })
    .eq('bracket_id', bracket_id)
    .eq('status', MatchupStatus.PENDING)
    .eq('round', current_round)

  if (!response.status || response.error) {
    throw new Error('Failed to update matchups for the current round')
  }

  return true
}
