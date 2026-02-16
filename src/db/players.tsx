import { encrypt } from '@/cryptography/cryptography'
import { useSupabaseClient } from '@/db/db'
import { MatchupStatus } from './matchups'
import { getBracketStatus } from './brackets'

export interface Player {
  id: number
  name: string
  gender: string
  clerk_id: string
  phone_number?: string
  paid?: boolean
}

export interface BracketPlayer {
  id: number
  name: string
  gender: string
  player_id: number
  bracket_id: number
  clerk_id: string
  phone_number?: string
  paid?: boolean
}

export interface Matchup {
  id: number
  player1_id: number
  player2_id: number
  player1_partner_id?: number
  player2_partner_id?: number
  winner_id?: number
  bracket_id: number
  score?: string
  status: 'PLANNING' | 'COMPLETED' | 'PENDING'
  round: number
}

export type MatchupDetails = Matchup & {
  player1: Player | null
  player2: Player | null
  player1Partner: Player | null
  player2Partner: Player | null
}

export const fetchAllPlayers = async (token: any, isAdmin: boolean) => {
  const supabase = useSupabaseClient(token)
  const columns = isAdmin
    ? 'id, name, gender, phone_number, clerk_id'
    : 'id, name, gender, clerk_id'
  const response = await supabase.from('players').select(columns)
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data as unknown as Player[]
}

export const fetchAllPlayersInBracket = async (
  bracketId: number,
  token: any,
) => {
  if (!bracketId) {
    return []
  }
  const supabase = useSupabaseClient(token)
  const response = await supabase
    .from('bracket_players')
    .select('id, player_id, bracket_id, paid')
    .eq('bracket_id', bracketId)
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}

export const registerPlayerToBracket = async (
  playerId: number,
  bracketId: number,
  token: any,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase.from('bracket_players').insert({
    player_id: playerId,
    bracket_id: bracketId,
    paid: false,
  })
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}

export const addPlayerToBracket = async (
  playerId: number,
  bracketId: number,
  token: any,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase.from('bracket_players').insert({
    player_id: playerId,
    bracket_id: bracketId,
    paid: false,
  })
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}

export const removePlayerFromBracket = async (
  playerId: number,
  bracketId: number,
  token: any,
) => {
  const supabase = useSupabaseClient(token)
  const response = await supabase
    .from('bracket_players')
    .delete()
    .eq('player_id', playerId)
    .eq('bracket_id', bracketId)
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.data
}

export const registerPlayer = async (
  clerkId: string,
  name: string,
  gender: string,
  phoneNumber: string,
  token: any,
) => {
  const supabase = useSupabaseClient(token)

  // Encrypt the phone number
  const encryptedPhoneNumber = encrypt(phoneNumber)

  const response = await supabase.from('players').insert({
    clerk_id: clerkId,
    name,
    gender,
    phone_number: encryptedPhoneNumber,
  })
  if (!response.status || response.error) {
    throw new Error('Network response was not ok')
  }
  return response.status
}

export const fetchMatchupsForBracket = async (
  bracketId: number,
  round: number,
  token: any,
) => {
  const supabase = useSupabaseClient(token)
  const bracketStatus = await getBracketStatus(token, bracketId)

  if (bracketStatus === 'PENDING') {
    const response = await supabase
      .from('matchups')
      .select(
        'id, player1_id, player2_id, player1_partner_id, player2_partner_id, winner_id, bracket_id, score, status, round',
      )
      .eq('bracket_id', bracketId)
      .eq('round', round)
      .order('status', { ascending: true })

    if (!response.status || response.error) {
      throw new Error('Network response was not ok')
    }

    return response.data
  } else {
    const response = await supabase
      .from('matchups')
      .select(
        'id, player1_id, player2_id, player1_partner_id, player2_partner_id, winner_id, bracket_id, score, status, round',
      )
      .eq('bracket_id', bracketId)
      .eq('round', round)
      .in('status', [MatchupStatus.IN_PROGRESS, MatchupStatus.COMPLETED])
      .order('status', { ascending: true })

    if (!response.status || response.error) {
      throw new Error('Network response was not ok')
    }

    return response.data
  }
}
