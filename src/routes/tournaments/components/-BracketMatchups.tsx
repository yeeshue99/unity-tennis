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
  Select,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'

interface BracketMatchupsProps {
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

const BracketMatchups: React.FC<BracketMatchupsProps> = ({ bracketId }) => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [format, setFormat] = useState('ROUND_ROBIN')

  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormat(event.target.value)
  }

  const { data: matchups = [], refetch } = useQuery<Matchup[], Error>({
    queryKey: ['matchups', bracketId],
    queryFn: async () => {
      if (!bracketId) {
        throw new Error('Invalid bracket ID')
      }
      return [] // Placeholder until API is implemented

      // const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/matchups`);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch matchups");
      // }
      // return response.json();
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

      // const response = await fetch(`${API_BASE_URL}/matchups/generate`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ bracket_id: bracketId, format }),
      // });
      // if (!response.ok) {
      //   throw new Error("Failed to create matchups");
      // }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchups', bracketId] })
      refetch()
    },
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

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const groupedMatchups = matchups.reduce<Record<number, Matchup[]>>(
    (acc, matchup) => {
      const round = matchup.round || 0
      if (!acc[round]) {
        acc[round] = []
      }
      acc[round].push(matchup)
      return acc
    },
    {},
  )

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
    <div>
      <FormControl fullWidth style={{ marginBottom: '1rem' }}>
        <InputLabel id="format-dropdown-label">Select Format</InputLabel>
        <Select
          labelId="format-dropdown-label"
          id="format-dropdown"
          value={format}
          onChange={handleFormatChange}
        >
          <MenuItem value="ROUND_ROBIN">Round-Robin</MenuItem>
          <MenuItem value="SWISS">Swiss</MenuItem>
        </Select>
      </FormControl>

      {matchups.length === 0 ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateMatchups}
          disabled={
            createMatchupsMutation.status === 'pending' || bracketId === null
          }
        >
          Create Matchups
        </Button>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenModal}
            style={{ flex: 1 }}
          >
            View Matchups
          </Button>
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

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Matchups</DialogTitle>
        <DialogContent>
          {Object.entries(groupedMatchups).map(([round, roundMatchups]) => (
            <div key={round} style={{ marginBottom: '2rem' }}>
              <h3>Round {round}</h3>
              {roundMatchups.map((matchup: Matchup, index: number) => (
                <div key={`${round}-${index}`} style={{ marginBottom: '1rem' }}>
                  <strong>Matchup {index + 1}:</strong>
                  {matchup.player1_partner && matchup.player2_partner ? (
                    <span>
                      {matchup.player1.name} & {matchup.player1_partner.name} vs{' '}
                      {matchup.player2.name} & {matchup.player2_partner.name}
                    </span>
                  ) : (
                    <span>
                      {matchup.player1.name} vs {matchup.player2.name}
                    </span>
                  )}
                  {editingScore[matchup.id] ? (
                    <div>
                      <input
                        type="text"
                        value={scoreInput[matchup.id] || ''}
                        onChange={(e) =>
                          handleScoreChange(matchup.id, e.target.value)
                        }
                      />
                      <button onClick={() => handleSubmitScore(matchup.id)}>
                        Submit
                      </button>
                      <div>
                        <label htmlFor={`winner-select-${matchup.id}`}>
                          Select Winner:
                        </label>
                        <select
                          id={`winner-select-${matchup.id}`}
                          value={matchup.winner?.id || ''}
                          onChange={(e) =>
                            handleWinnerChange(
                              matchup.id,
                              parseInt(e.target.value),
                            )
                          }
                        >
                          <option value="">-- Select Winner --</option>
                          <option value={matchup.player1.id}>
                            {matchup.player1.name}
                          </option>
                          <option value={matchup.player2.id}>
                            {matchup.player2.name}
                          </option>
                          {matchup.player1_partner && (
                            <option value={matchup.player1_partner.id}>
                              {matchup.player1_partner.name}
                            </option>
                          )}
                          {matchup.player2_partner && (
                            <option value={matchup.player2_partner.id}>
                              {matchup.player2_partner.name}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleEditScore(matchup.id)}>
                      Edit Score
                    </button>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '1rem',
                    }}
                  >
                    {matchup.winner && (
                      <p>
                        <strong>Winner:</strong> {matchup.winner.name}
                      </p>
                    )}
                    {matchup.score && (
                      <p>
                        <strong>Score:</strong> {matchup.score}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BracketMatchups
