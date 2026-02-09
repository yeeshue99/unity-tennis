import { createFileRoute, useNavigate } from '@tanstack/react-router'
import TournamentDropdown from '../tournaments/components/-TournamentDropdown'
import { useAuth, useSession, useUser } from '@clerk/clerk-react'
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
import ScoreModal from './ScoreModal'

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
  const { isSignedIn } = useUser()
  const { has } = useAuth()
  const navigate = useNavigate()
  const { session } = useSession()
  const canManage = has ? has({ role: 'org:admin' }) : false
  const isAdmin = isSignedIn && canManage

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', isAdmin],
    queryFn: async () => {
      const response = await fetchAllPlayers(
        await session?.getToken(),
        !!isAdmin,
      )
      if (!response) {
        throw new Error('Failed to fetch all players')
      }

      savedPlayersCollection.insert(response as unknown as SavedPlayer[])
      console.log(savedPlayersCollection.get(1))

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

  const { data: matchups = [] as MatchupDetails[] } = useQuery<
    MatchupDetails[]
  >({
    queryKey: ['matchups', isAdmin, allPlayers.length, bracketId, 1],
    queryFn: async () => {
      if (!bracketId) {
        return []
      }

      const response = await fetchMatchupsForBracket(
        bracketId,
        1,
        await session?.getToken(),
      )
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMatchup, setSelectedMatchup] = useState<MatchupDetails | null>(
    null,
  )

  const setScore = (matchupId: number) => {
    const matchup = matchups.find((m) => m.id === matchupId)
    setSelectedMatchup(matchup || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMatchup(null)
  }

  const handleSaveScore = (score: string) => {
    console.log(`Saving score for matchup ${selectedMatchup?.id}: ${score}`)
    // Add logic to save the score here
    closeModal()
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
                search: (s) => ({
                  ...s,
                  tournamentId: id,
                  bracketId: s.bracketId ?? null,
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
                search: (s) => ({
                  ...s,
                  tournamentId: s.tournamentId ?? null,
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
                <strong>Matchup ID:</strong> {matchup.id}
              </p>
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
