import { useSupabaseClient } from '@/db/db'
import { getBracketStatus } from './brackets'

export enum MatchupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const fetchMatchups = async (
  token: any,
  bracket_id: number,
  head_only: boolean = false,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase
    .from('matchups')
    .select('id', { count: 'exact', head: head_only })
    .eq('bracket_id', bracket_id)

  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }

  if (head_only) {
    return response.count || 0
  }
  return response.data
}

export const deleteAllMatchups = async (token: any, bracket_id: number) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase
    .from('matchups')
    .delete()
    .eq('bracket_id', bracket_id)

  if (!response.status || response.error) {
    throw new Error('Failed to delete matchups')
  }

  return response.data
}

export const updateMatchup = async (
  token: any,
  matchup_id: number,
  winner_id: number,
  score: string,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase
    .from('matchups')
    .update({ winner_id, score, status: 'COMPLETED' })
    .eq('id', matchup_id)

  if (!response.status || response.error) {
    throw new Error('Failed to update matchup')
  }

  return response.data
}

export const generateMatchups = async (
  token: any,
  bracket_id: number,
  format: string,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase.functions.invoke('generate-matchups', {
    body: { name: 'Functions', bracket_id, format },
  })

  if (!response || response.error) {
    throw new Error('Failed to generate matchups')
  }

  return true
}

export const getRoundsForBracket = async (token: any, bracket_id: number) => {
  const supabase = useSupabaseClient(token)
  const bracketStatus = await getBracketStatus(token, bracket_id)

  if (bracketStatus === 'PENDING') {
    const response = await supabase.rpc('get_unique_rounds_all', {
      p_bracket_id: bracket_id,
    })

    if (!response.status || response.error) {
      throw new Error('Network response was not ok')
    }

    return response.data || []
  } else {
    const response = await supabase.rpc('get_unique_rounds', {
      p_bracket_id: bracket_id,
    })

    if (!response.status || response.error) {
      throw new Error('Network response was not ok')
    }

    console.log(response.data)

    return response.data || []
  }
}
