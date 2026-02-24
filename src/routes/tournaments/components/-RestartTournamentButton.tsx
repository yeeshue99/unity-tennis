import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { QueryClient } from '@tanstack/react-query'
import { resetTournament } from '@/db/tournaments'
import { useAlert } from '@/lib/alert-context'

interface RestartTournamentButtonProps {
  tournamentId: number | null
  bracketId: number | null
  queryClient: QueryClient
}

const RestartTournamentButton: React.FC<RestartTournamentButtonProps> = ({
  tournamentId,
  bracketId,
  queryClient,
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()

  const handleConfirm = async () => {
    if (!tournamentId) return
    setLoading(true)
    try {
      await resetTournament(tournamentId)
      queryClient.invalidateQueries({ queryKey: ['bracketStatus', bracketId] })
      queryClient.invalidateQueries({ queryKey: ['matchups', bracketId] })
      queryClient.invalidateQueries({ queryKey: ['rounds', bracketId] })
      queryClient.invalidateQueries({
        queryKey: ['availableRounds', bracketId],
      })
      showAlert('Tournament reset to pending', 'warning', 'Restarted')
    } catch (e: unknown) {
      showAlert(
        e instanceof Error ? e.message : 'Failed to restart tournament',
        'error',
        'Error',
      )
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={() => setOpen(true)}
        fullWidth
        disabled={!tournamentId || !bracketId}
        style={{ marginTop: '0.5rem' }}
      >
        Restart Tournament
      </Button>

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle style={{ color: '#c62828' }}>
          Restart Tournament?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset the tournament, all its brackets, and{' '}
            <strong>all matchup scores and winners</strong> back to{' '}
            <strong>PENDING</strong>. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            color="error"
            variant="contained"
            startIcon={<RestartAltIcon />}
          >
            {loading ? 'Resetting…' : 'Yes, Restart'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RestartTournamentButton
