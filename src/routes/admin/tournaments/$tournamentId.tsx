import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Box,
  Button,
  Chip,
  Collapse,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useState } from 'react'
import { fetchBracketsForTournament, createBracket } from '@/db/brackets'
import { useAlert } from '@/lib/alert-context'
import {
  fetchAllPlayers,
  fetchAllPlayersInBracket,
  addPlayerToBracket,
  removePlayerFromBracket,
  updateBracketPlayerPaid,
  Player,
  BracketPlayer,
} from '@/db/players'
import { fetchTournaments } from '@/db/tournaments'
import { ThemedSelect } from '@/components/ThemedSelect'
import { ThemedTextField } from '@/components/ThemedTextField'
import Loader from '@/components/Loader'

type TOURNAMENTS_SEARCH_PARAMS = {
  bracketId: number | null
}

export const Route = createFileRoute('/admin/tournaments/$tournamentId')({
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
  const { bracketId: initialBracketId } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedBracketId, setSelectedBracketId] = useState<number | null>(
    initialBracketId,
  )
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showNewBracket, setShowNewBracket] = useState(false)
  const [newBracketName, setNewBracketName] = useState('')
  const { showAlert } = useAlert()

  // Fetch tournament info
  const { data: tournaments = [] } = useQuery({
    queryKey: ['admin', 'tournaments'],
    queryFn: fetchTournaments,
  })
  const tournament = (tournaments as any[]).find(
    (t) => t.id === Number(tournamentId),
  )

  // Fetch brackets for this tournament
  const { data: brackets = [] } = useQuery({
    queryKey: ['brackets', Number(tournamentId)],
    queryFn: () => fetchBracketsForTournament(Number(tournamentId)),
    enabled: !!tournamentId,
  })

  // Fetch all players (for add-player autocomplete)
  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', true],
    queryFn: () => fetchAllPlayers(true),
  })

  // Fetch players in the selected bracket
  const { data: bracketPlayers = [], isLoading: playersLoading } = useQuery<
    BracketPlayer[]
  >({
    queryKey: ['bracketPlayers', selectedBracketId],
    queryFn: async () => {
      if (!selectedBracketId) return []
      const raw = await fetchAllPlayersInBracket(selectedBracketId)
      return (raw ?? []).map((bp: any) => {
        const p = allPlayers.find((a) => a.id === bp.player_id)
        return {
          ...bp,
          name: p?.name ?? 'Unknown',
          gender: p?.gender ?? '—',
          phone_number: p?.phone_number ?? '—',
          supabase_id: p?.supabase_id ?? '',
        }
      }) as BracketPlayer[]
    },
    enabled: !!selectedBracketId && allPlayers.length > 0,
  })

  const availablePlayers = allPlayers.filter(
    (p) => !bracketPlayers.some((bp) => bp.player_id === p.id),
  )

  const createBracketMutation = useMutation({
    mutationFn: () =>
      createBracket(newBracketName.trim(), Number(tournamentId)),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['brackets', Number(tournamentId)],
      })
      setNewBracketName('')
      setShowNewBracket(false)
      showAlert('Bracket created!', 'success')
      if (data?.id) handleBracketChange(data.id)
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to create bracket'),
  })

  const addPlayerMutation = useMutation({
    mutationFn: (playerId: number) =>
      addPlayerToBracket(playerId, selectedBracketId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', selectedBracketId],
      })
      setSelectedPlayer(null)
      showAlert('Player added to bracket', 'success')
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to add player'),
  })

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: number) =>
      removePlayerFromBracket(playerId, selectedBracketId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', selectedBracketId],
      })
      showAlert('Player removed from bracket', 'info')
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to remove player'),
  })

  const togglePaidMutation = useMutation({
    mutationFn: ({
      bracketPlayerId,
      paid,
    }: {
      bracketPlayerId: number
      paid: boolean
    }) => updateBracketPlayerPaid(bracketPlayerId, paid),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', selectedBracketId],
      }),
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to update payment status'),
  })

  const handleBracketChange = (id: number | null) => {
    setSelectedBracketId(id)
    navigate({
      to: '/admin/tournaments/$tournamentId',
      params: { tournamentId },
      search: { bracketId: id },
    })
  }

  const paidCount = bracketPlayers.filter((p) => p.paid).length

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
      {/* Back link */}
      <Button
        component={Link}
        to="/admin"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: 'var(--color-text-muted)' }}
      >
        Back to Admin
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {tournament?.name ?? `Tournament #${tournamentId}`}
      </Typography>

      {tournament && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            label={tournament.status}
            size="small"
            color={
              tournament.status === 'IN_PROGRESS'
                ? 'success'
                : tournament.status === 'COMPLETED'
                  ? 'default'
                  : 'warning'
            }
          />
          <Chip label={tournament.format} size="small" variant="outlined" />
        </Stack>
      )}

      {/* Bracket selector + create */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 280 }}>
          <ThemedSelect
            label="Select Bracket"
            value={selectedBracketId ?? ''}
            onChange={(e) =>
              handleBracketChange(e.target.value as number | null)
            }
          >
            <MenuItem value="">
              <em>— choose a bracket —</em>
            </MenuItem>
            {(brackets as any[]).map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </ThemedSelect>
        </Box>
        <Button
          variant={showNewBracket ? 'outlined' : 'contained'}
          startIcon={<AddIcon />}
          onClick={() => setShowNewBracket((v) => !v)}
          sx={{ mt: 0.5 }}
        >
          {showNewBracket ? 'Cancel' : 'New Bracket'}
        </Button>
      </Stack>

      <Collapse in={showNewBracket}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, maxWidth: 420 }}>
          <Typography variant="subtitle2" gutterBottom>
            Create New Bracket
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <ThemedTextField
              label="Bracket Name"
              size="small"
              value={newBracketName}
              onChange={(e) => setNewBracketName(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              disabled={
                !newBracketName.trim() || createBracketMutation.isPending
              }
              onClick={() => createBracketMutation.mutate()}
            >
              {createBracketMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {selectedBracketId && (
        <>
          {/* Summary */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {bracketPlayers.length} player
              {bracketPlayers.length !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {paidCount} paid · {bracketPlayers.length - paidCount} unpaid
            </Typography>
          </Stack>

          {/* Players table */}
          <Paper variant="outlined" sx={{ mb: 3 }}>
            {playersLoading ? (
              <Loader />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="center">Paid</TableCell>
                    <TableCell align="right">Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bracketPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No players in this bracket yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bracketPlayers.map((bp) => (
                      <TableRow key={bp.id}>
                        <TableCell>{bp.name}</TableCell>
                        <TableCell>{bp.gender}</TableCell>
                        <TableCell>{bp.phone_number || '—'}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={!!bp.paid}
                            size="small"
                            color="success"
                            onChange={(e) =>
                              togglePaidMutation.mutate({
                                bracketPlayerId: bp.id,
                                paid: e.target.checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() =>
                              removePlayerMutation.mutate(bp.player_id)
                            }
                            disabled={removePlayerMutation.isPending}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* Add player */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add Player to Bracket
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Autocomplete
                options={availablePlayers}
                getOptionLabel={(o) => o.name}
                value={selectedPlayer}
                onChange={(_, v) => setSelectedPlayer(v)}
                sx={{ flex: 1 }}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      '& .MuiAutocomplete-option:hover': {
                        backgroundColor: 'var(--color-surface-2)',
                      },
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search players"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-surface)',
                        '& fieldset': { borderColor: 'var(--color-border)' },
                        '&:hover fieldset': {
                          borderColor: 'var(--color-primary)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--color-primary)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--color-text-muted)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'var(--color-primary)',
                      },
                      '& .MuiSvgIcon-root': { color: 'var(--color-text)' },
                    }}
                  />
                )}
              />
              <Button
                variant="contained"
                disabled={!selectedPlayer || addPlayerMutation.isPending}
                onClick={() =>
                  selectedPlayer && addPlayerMutation.mutate(selectedPlayer.id)
                }
              >
                Add
              </Button>
            </Stack>
          </Paper>
        </>
      )}

      {!selectedBracketId && brackets.length === 0 && (
        <Typography color="text.secondary">
          No brackets found for this tournament. Create one in the{' '}
          <Link to="/admin" style={{ color: 'var(--color-primary)' }}>
            admin panel
          </Link>
          .
        </Typography>
      )}
    </Box>
  )
}
