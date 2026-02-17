import { createSupabaseClient } from './db'

export const getBracketStatus = async (bracket_id: number) => {
  const supabase = createSupabaseClient()
  const response = await supabase
    .from('brackets')
    .select('status')
    .eq('id', bracket_id)

  if (!response.status || response.error) {
    throw new Error('Failed to fetch bracket status')
  }

  return response.data[0]?.status || 'PENDING'
}

export const fetchBracketsForTournament = async (tournamentId: number) => {
  const supabase = createSupabaseClient()
  const response = await supabase
    .from('brackets')
    .select('id, name')
    .eq('tournament_id', tournamentId)

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }

  return response.data
}
