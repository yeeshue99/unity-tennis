import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { ThemedSelect } from '@/components/ThemedSelect'
import {
  deleteAllMatchups,
  fetchMatchups,
  generateMatchups,
} from '@/db/matchups'
import { Link } from '@tanstack/react-router'
import { useAlert } from '@/lib/alert-context'

interface BracketMatchupsProps {
  tournamentId: number | null
  bracketId: number | null
}

interface Player {
  id: number
  name: string
  gender: string
  phone_number: string
}

interface Matchup {
  id: number
  player1: Player
  player2: Player
  player1_partner: Player | null
  player2_partner: Player | null
  winner: Player | null
  round: number // Added round property
  score: string | null // Added score property
}

// const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const BracketMatchups: React.FC<BracketMatchupsProps> = ({
  tournamentId,
  bracketId,
}) => {
  const queryClient = useQueryClient()
  const [format, setFormat] = useState('ROUND_ROBIN')
  const { showAlert } = useAlert()

  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormat(event.target.value)
  }

  const { data: hasMatchups = 0, refetch } = useQuery<number, Error>({
    queryKey: ['matchups', bracketId, true],
    queryFn: async () => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }

      const response = await fetchMatchups(bracketId!, true)

      if (!response) {
        throw new Error('Failed to fetch matchups')
      }

      return response as number
    },
  })

  const createMatchupsMutation = useMutation<
    void,
    Error,
    { bracketId: number | null; format: string }
  >({
    mutationFn: async ({ bracketId, format }) => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }

      await deleteAllMatchups(bracketId!)

      await generateMatchups(bracketId!, 'ROUND_ROBIN')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchups', bracketId] })
      refetch()
      showAlert('Matchups generated successfully', 'success')
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to generate matchups'),
  })

  const updateMatchupMutation = useMutation<
    void,
    Error,
    { matchupId: number; score: string; status: string }
  >({
    mutationFn: async ({}) => {
      // const response = await fetch(
      //   `${API_BASE_URL}/matchups/${matchupId}`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ score, status }),
      //   }
      // );
      // if (!response.ok) {
      //   throw new Error("Failed to update matchup");
      // }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchups', bracketId] })
      refetch()
    },
  })

  const updateWinnerMutation = useMutation<
    void,
    Error,
    { matchupId: number; winnerId: number }
  >({
    mutationFn: async ({}) => {
      // const response = await fetch(
      //   `${API_BASE_URL}/matchups/${matchupId}`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ winner_id: winnerId }),
      //   }
      // );
      // if (!response.ok) {
      //   throw new Error("Failed to update winner");
      // }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchups', bracketId] })
      refetch()
    },
  })

  const handleCreateMatchups = () => {
    createMatchupsMutation.mutate({ bracketId: bracketId, format })
  }

  // const groupedMatchups = hasMatchups.reduce<Record<number, Matchup[]>>(
  //   (acc, matchup) => {
  //     const round = matchup.round || 0
  //     if (!acc[round]) {
  //       acc[round] = []
  //     }
  //     acc[round].push(matchup)
  //     return acc
  //   },
  //   {},
  // )

  const [editingScore, setEditingScore] = useState<{ [key: number]: boolean }>(
    {},
  )
  const [scoreInput, setScoreInput] = useState<{ [key: number]: string }>({})

  const handleEditScore = (matchupId: number) => {
    setEditingScore((prev) => ({ ...prev, [matchupId]: true }))
  }

  const handleScoreChange = (matchupId: number, value: string) => {
    setScoreInput((prev) => ({ ...prev, [matchupId]: value }))
  }

  const handleSubmitScore = (matchupId: number) => {
    const score = scoreInput[matchupId]
    if (score) {
      updateMatchupMutation.mutate({ matchupId, score, status: 'COMPLETED' })
    }
    setEditingScore((prev) => ({ ...prev, [matchupId]: false }))
  }

  const handleWinnerChange = (matchupId: number, winnerId: number) => {
    updateWinnerMutation.mutate({ matchupId, winnerId })
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <ThemedSelect
        labelId="format-dropdown-label"
        id="format-dropdown"
        value={format}
        label="Select Format"
        onChange={handleFormatChange}
        sx={{ marginBottom: '1rem' }}
      >
        <MenuItem value="ROUND_ROBIN">Round-Robin</MenuItem>
        <MenuItem value="SWISS">Swiss</MenuItem>
      </ThemedSelect>

      {hasMatchups === 0 ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateMatchups}
            fullWidth
            disabled={
              createMatchupsMutation.status === 'pending' || bracketId === null
            }
          >
            Create Matchups
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/matchups"
            params={{ tournamentId: String() }}
            className="tournamentLink"
            search={(prev) => ({
              tournamentId: tournamentId ? Number(tournamentId) : null,
              bracketId: bracketId ? Number(bracketId) : null,
            })}
            style={{ flex: 1 }}
          >
            <Button variant="contained" color="secondary" fullWidth>
              View Matchups
            </Button>
          </Link>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateMatchups}
            disabled={
              createMatchupsMutation.status === 'pending' || bracketId === null
            }
            style={{ flex: 1 }}
          >
            Regenerate Matchups
          </Button>
        </div>
      )}
    </div>
  )
}

export default BracketMatchups
