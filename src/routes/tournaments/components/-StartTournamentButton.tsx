import { getBracketStatus } from '@/db/brackets'
import { fetchMatchups, MatchupStatus } from '@/db/matchups'
import { Matchup } from '@/db/players'
import { activateNextRound, startTournament } from '@/db/tournaments'
import { useCurrentUser } from '@/db/users'
import { Button } from '@mui/material'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { useAlert } from '@/lib/alert-context'

interface StartTournamentButtonProps {
  tournamentId: number | null
  bracketId: number | null
  queryClient: QueryClient
}

const StartTournamentButton: React.FC<StartTournamentButtonProps> = ({
  tournamentId,
  bracketId,
  queryClient,
}) => {
  const { data: hasMatchups = 0, refetch: refetchMatchups } = useQuery<
    number,
    Error
  >({
    queryKey: ['matchups', bracketId, true],
    queryFn: async () => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }

      const response = await fetchMatchups(bracketId!, true)

      if (!response) {
        throw new Error('Failed to fetch matchups')
      }

      return response as unknown as number
    },
  })

  const { data: status, refetch: refetchStatus } = useQuery<string, Error>({
    queryKey: ['bracketStatus', bracketId],
    queryFn: async () => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }

      const response = await getBracketStatus(bracketId!)

      if (!response) {
        throw new Error('Failed to fetch matchups')
      }

      return response as unknown as string
    },
  })

  const { showAlert } = useAlert()

  const handleStartTournament = async () => {
    if (!bracketId) return
    try {
      await startTournament(tournamentId!, bracketId!)
      showAlert('Tournament started!', 'success')
      refetchMatchups()
      refetchStatus()
    } catch (e: unknown) {
      showAlert(
        e instanceof Error ? e.message : 'Failed to start tournament',
        'error',
        'Error',
      )
    }
  }

  const handleStartNextRound = async () => {
    if (!bracketId) return
    try {
      await activateNextRound(tournamentId!, bracketId!)
      showAlert('Next round started!', 'success')
      queryClient.invalidateQueries({
        queryKey: ['rounds', Number(bracketId)],
      })
    } catch (e: unknown) {
      showAlert(
        e instanceof Error ? e.message : 'Failed to start next round',
        'error',
        'Error',
      )
    }
  }

  if (hasMatchups! <= 0 || status === MatchupStatus.PENDING) {
    return (
      <Button
        variant="contained"
        color="success"
        onClick={handleStartTournament}
        fullWidth
        disabled={hasMatchups! === 0 || !bracketId}
      >
        Start Tournament
      </Button>
    )
  }

  return (
    <Button
      variant="contained"
      color="warning"
      onClick={handleStartNextRound}
      fullWidth
      disabled={
        status === MatchupStatus.COMPLETED ||
        status === MatchupStatus.PENDING ||
        !bracketId
      }
    >
      Start Next Round
    </Button>
  )
}

export default StartTournamentButton
