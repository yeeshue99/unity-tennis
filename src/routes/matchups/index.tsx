import { createFileRoute, useNavigate } from '@tanstack/react-router'
import TournamentDropdown from '../tournaments/components/-TournamentDropdown'
import BracketDropdown from '../tournaments/components/-BracketDropdown'
import { Bracket, IRoundProps } from '@oliverlooney/react-brackets'
import {
  fetchAllPlayers,
  fetchMatchupsForBracket,
  Matchup,
  MatchupDetails,
  Player,
} from '@/db/players'
import { useQuery } from '@tanstack/react-query'
import { SavedPlayer, savedPlayersCollection } from '@/db/saved-players'
import { useState } from 'react'
import ScoreModal from './-ScoreModal'
import { getRoundsForBracket, updateMatchup } from '@/db/matchups'
import { Select, MenuItem, InputLabel } from '@mui/material'
import { useCurrentUser } from '@/db/users'
import Loader from '@/components/Loader'

type MATCHUP_SEARCH_PARAMS = {
  tournamentId: number | null
  bracketId: number | null
}
export const Route = createFileRoute('/matchups/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): MATCHUP_SEARCH_PARAMS => {
    return {
      tournamentId: Number(search.tournamentId) || null,
      bracketId: Number(search.bracketId) || null,
    }
  },
})

function RouteComponent() {
  const { tournamentId, bracketId } = Route.useSearch()
  const { isAdmin, isLoaded } = useCurrentUser()
  const navigate = useNavigate()

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', isAdmin!],
    queryFn: async () => {
      const response = await fetchAllPlayers(!!isAdmin)
      if (!response) {
        throw new Error('Failed to fetch all players')
      }

      try {
        savedPlayersCollection.insert(response as unknown as SavedPlayer[])
      } catch (error) {}

      return response as unknown as Player[]
    },
  })

  const getPlayerDetails = (playerId: number | undefined) => {
    if (!playerId) {
      return null
    }

    return (
      savedPlayersCollection.get(playerId) ||
      allPlayers.find((p) => p.id === playerId)
    )
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMatchup, setSelectedMatchup] = useState<MatchupDetails | null>(
    null,
  )
  const [selectedRound, setSelectedRound] = useState<number>(1)

  const { data: matchups = [] as MatchupDetails[] } = useQuery<
    MatchupDetails[]
  >({
    queryKey: [
      'matchups',
      isAdmin,
      allPlayers.length,
      bracketId,
      selectedRound,
    ],
    queryFn: async () => {
      if (!bracketId) {
        return []
      }

      const response = await fetchMatchupsForBracket(bracketId, selectedRound)
      if (!response) {
        throw new Error('Failed to fetch all players')
      }

      const matchupDetails = response.map((matchup: Matchup) => {
        const player1Details = getPlayerDetails(matchup.player1_id)
        const player2Details = getPlayerDetails(matchup.player2_id)
        const player1PartnerDetails = getPlayerDetails(
          matchup.player1_partner_id,
        )
        const player2PartnerDetails = getPlayerDetails(
          matchup.player2_partner_id,
        )
        return {
          ...matchup,
          player1: player1Details,
          player2: player2Details,
          player1Partner: player1PartnerDetails,
          player2Partner: player2PartnerDetails,
          winner_id: matchup.winner_id,
          status: matchup.status,
          round: matchup.round,
        }
      })

      return matchupDetails as unknown as MatchupDetails[]
    },
  })

  const { data: rounds = [] as number[] } = useQuery<number[]>({
    queryKey: ['rounds', bracketId],
    queryFn: async () => {
      if (!bracketId) {
        return []
      }

      const response = await getRoundsForBracket(bracketId)

      if (!response) {
        throw new Error('Failed to fetch rounds for bracket')
      }

      return response as unknown as number[]
    },
  })

  const setScore = (matchupId: number) => {
    const matchup = matchups.find((m) => m.id === matchupId)
    setSelectedMatchup(matchup || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMatchup(null)
  }

  const handleSaveScore = async (score: string, winnerId?: number) => {
    console.log('Saving score:', {
      score,
      winnerId,
      matchupId: selectedMatchup?.id,
    })
    updateMatchup(
      selectedMatchup!.id,
      winnerId ?? selectedMatchup!.winner_id!,
      score,
    )

    closeModal()
  }

  if (!isLoaded) {
    return <Loader />
  }

  if (!tournamentId || !bracketId) {
    return (
      <div
        style={{
          padding: '2rem',
          top: 0,
          margin: '0 auto',
          maxWidth: '80vw',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Matchups</h2>
        An error has occurred. Please select a tournament and bracket to view
        matchups.
        <div style={{ display: 'flex', marginTop: '2rem', gap: '1rem' }}>
          <TournamentDropdown
            selectedTournament={tournamentId ? Number(tournamentId) : null}
            onTournamentChange={(id) => {
              navigate({
                to: '/matchups',
                search: (prev) => ({
                  ...prev,
                  tournamentId: id,
                  bracketId: prev?.bracketId ?? null,
                }),
              })
            }}
          />
          <BracketDropdown
            selectedTournament={tournamentId ? Number(tournamentId) : null}
            selectedBracket={bracketId ? Number(bracketId) : null}
            disabled={!tournamentId}
            onBracketChange={(id) => {
              navigate({
                to: '/matchups',
                search: (prev) => ({
                  ...prev,
                  tournamentId: prev?.tournamentId ?? null,
                  bracketId: id,
                }),
              })
            }}
          />
        </div>
      </div>
    )
  }

  // Adjusted the layout to place the button to the right of the <p> texts
  return (
    <div
      style={{
        padding: '2rem',
        top: 0,
        margin: '0 auto',
        maxWidth: '80vw',
      }}
    >
      <h2 className="text-2xl font-bold mb-4">Matchups</h2>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <InputLabel id="select-round-label">Round: </InputLabel>
        <Select
          labelId="select-round-label"
          label="Round: "
          value={selectedRound}
          onChange={(e) => setSelectedRound(Number(e.target.value))}
          style={{ padding: '0.25rem', borderRadius: 4 }}
        >
          {rounds.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        {matchups.map((matchup) => (
          <div
            key={matchup.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
            className={matchup.winner_id ? 'bg-green-300' : ''}
          >
            <div>
              <p>
                <strong>Round:</strong> {matchup.round}
              </p>
              <p>
                <strong>Status:</strong> {matchup.status}
              </p>
              <p>
                <strong>Winner:</strong>{' '}
                {matchup.winner_id &&
                matchup.winner_id === matchup.player1_id &&
                matchup.player1
                  ? matchup.player1.name
                  : matchup.winner_id === matchup.player2_id && matchup.player2
                    ? matchup.player2.name
                    : 'N/A'}
              </p>
              <p>
                <strong>Score:</strong> {matchup.score || 'N/A'}
              </p>
              <p>
                <strong>
                  {matchup.player1Partner ? 'Team 1' : 'Player 1'}:
                </strong>{' '}
                {matchup.player1 ? `${matchup.player1.name}` : 'N/A'}
              </p>
              {matchup.player1Partner && (
                <p>
                  {matchup.player1Partner
                    ? `${matchup.player1Partner.name}`
                    : 'N/A'}
                </p>
              )}
              <p>
                <strong>
                  {matchup.player2Partner ? 'Team 2' : 'Player 2'}:
                </strong>{' '}
                {matchup.player2 ? `${matchup.player2.name}` : 'N/A'}
              </p>
              {matchup.player2Partner && (
                <p>
                  {matchup.player2Partner
                    ? `${matchup.player2Partner.name}`
                    : 'N/A'}
                </p>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setScore(matchup.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Set Score
              </button>
            </div>
          </div>
        ))}
      </div>

      <ScoreModal
        isOpen={isModalOpen}
        selectedMatchup={selectedMatchup}
        onClose={closeModal}
        onSave={handleSaveScore}
      />
    </div>
  )
}

export default RouteComponent
