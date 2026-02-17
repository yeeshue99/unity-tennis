import { createFileRoute, useNavigate } from '@tanstack/react-router'
import TournamentDropdown from './components/-TournamentDropdown'
import BracketDropdown from './components/-BracketDropdown'
import BracketPlayersTable from './components/-BracketPlayersTable'
import BracketMatchups from './components/-BracketMatchups'
import StartTournamentButton from './components/-StartTournamentButton'
import { useCurrentUser } from '@/db/users'
import Loader from '@/components/Loader'

type TOURNAMENTS_SEARCH_PARAMS = {
  bracketId: number | null
}

export const Route = createFileRoute('/tournaments/$tournamentId')({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): TOURNAMENTS_SEARCH_PARAMS => {
    return {
      bracketId: Number(search.bracketId) || null,
    }
  },
})

function RouteComponent() {
  const { tournamentId } = Route.useParams()
  const { bracketId } = Route.useSearch()
  const navigate = useNavigate()
  const { isAdmin, isLoaded } = useCurrentUser()

  const changeTournament = (tournamentId: number | null) => {
    if (tournamentId) {
      navigate({
        to: '/tournaments/$tournamentId',
        params: { tournamentId: String(tournamentId) },
        search: (prev) => ({ bracketId: bracketId }),
      })
    } else {
      navigate({ to: '/tournaments' })
    }
  }

  const setSelectedBracket = (bracketId: number | null) => {
    navigate({
      to: '/tournaments/$tournamentId',
      params: { tournamentId: String(tournamentId) },
      search: (prev) => ({ bracketId: bracketId }),
    })
  }

  if (!isLoaded) {
    return <Loader />
  }

  return (
    <div
      style={{
        padding: '2rem',
        top: 0,
        margin: '0 auto',
        maxWidth: '80vw',
      }}
    >
      <h1>Local Leagues</h1>
      <p>
        Join our local tennis leagues to compete, have fun, and connect with
        other players in your community.
      </p>
      <div style={{ display: 'flex', marginTop: '2rem', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <TournamentDropdown
            selectedTournament={Number(tournamentId) || null}
            onTournamentChange={changeTournament}
          />
        </div>
        <div style={{ flex: 1 }}>
          <BracketDropdown
            selectedTournament={Number(tournamentId) || null}
            selectedBracket={bracketId}
            onBracketChange={setSelectedBracket}
            disabled={false}
          />
        </div>
      </div>
      <BracketPlayersTable
        tournamentId={Number(tournamentId) || null}
        bracketId={bracketId}
      />
      {isAdmin && (
        <BracketMatchups
          tournamentId={Number(tournamentId) || null}
          bracketId={bracketId}
        />
      )}
      {isAdmin && (
        <StartTournamentButton
          tournamentId={Number(tournamentId) || null}
          bracketId={bracketId}
        />
      )}
    </div>
  )
}
