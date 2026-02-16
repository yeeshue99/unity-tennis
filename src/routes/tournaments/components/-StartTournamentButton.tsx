import { getBracketStatus } from '@/db/brackets'
import { fetchMatchups, MatchupStatus } from '@/db/matchups'
import { Matchup } from '@/db/players'
import { activateNextRound, startTournament } from '@/db/tournaments'
import { useAuth, useSession, useUser } from '@clerk/clerk-react'
import { Button } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

interface StartTournamentButtonProps {
  tournamentId: number | null
  bracketId: number | null
}

const StartTournamentButton: React.FC<StartTournamentButtonProps> = ({
  tournamentId,
  bracketId,
}) => {
  const { isSignedIn } = useUser()
  const { has } = useAuth()
  const canManage = has ? has({ role: 'org:admin' }) : false
  const isAdmin = isSignedIn && canManage
  const { session } = useSession()

  const { data: hasMatchups = 0, refetch: refetchMatchups } = useQuery<
    number,
    Error
  >({
    queryKey: ['matchups', bracketId, true],
    queryFn: async () => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }

      const response = await fetchMatchups(
        await session?.getToken(),
        bracketId!,
        true,
      )

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

      const response = await getBracketStatus(
        await session?.getToken(),
        bracketId!,
      )

      if (!response) {
        throw new Error('Failed to fetch matchups')
      }

      return response as unknown as string
    },
  })

  const handleStartTournament = async () => {
    if (!bracketId) {
      throw new Error('Invalid bracket ID')
    }

    await startTournament(await session?.getToken(), tournamentId!, bracketId!)

    refetchMatchups()
    refetchStatus()
  }

  const handleStartNextRound = async () => {
    if (!bracketId) {
      throw new Error('Invalid bracket ID')
    }

    await activateNextRound(
      await session?.getToken(),
      tournamentId!,
      bracketId!,
    )
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
      color="success"
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
