import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Autocomplete, Button, TextField, Tooltip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  addPlayerToBracket,
  fetchAllPlayers,
  fetchAllPlayersInBracket,
  removePlayerFromBracket,
} from '@/db/players'
import { decrypt } from '@/cryptography/cryptography'
import { Player, BracketPlayer } from '@/db/players'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from '@tanstack/react-router'
import { useCurrentUser } from '@/db/users'
import Loader from '@/components/Loader'
import { useAlert } from '@/lib/alert-context'
import { getBracketStatus } from '@/db/brackets'
import { MatchupStatus } from '@/db/matchups'

interface BracketPlayersTableProps {
  tournamentId: number | null
  bracketId: number | null
}

const BracketPlayersTable: React.FC<BracketPlayersTableProps> = ({
  tournamentId,
  bracketId,
}) => {
  const queryClient = useQueryClient()
  const { isSignedIn, user, isAdmin, isLoaded } = useCurrentUser()
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ['allPlayers', isAdmin],
    queryFn: async () => {
      const response = await fetchAllPlayers(isAdmin)
      if (!response) {
        throw new Error('Failed to fetch all players')
      }
      const processedResponse = response.map((player: Player) => {
        if (player.phone_number) {
          const decryptedPhoneNumber =
            decrypt(player.phone_number) || player.phone_number
          player.phone_number = formatPhoneNumber(decryptedPhoneNumber)
        }
        return player
      })
      return processedResponse as unknown as Player[]
    },
  })

  const { data: playersInBracket = [] as BracketPlayer[] } = useQuery<
    BracketPlayer[]
  >({
    queryKey: ['bracketPlayers', isAdmin!, allPlayers.length, bracketId],
    queryFn: async () => {
      if (!bracketId) {
        return []
      }

      const response = await fetchAllPlayersInBracket(bracketId)
      if (!response) {
        throw new Error('Failed to fetch all players')
      }

      const playersInBracketDetailed = response.map((bp) => {
        const playerDetails = allPlayers.find((p) => p.id === bp.player_id)
        return {
          ...bp,
          name: playerDetails ? playerDetails.name : 'Unknown Player',
          gender: playerDetails ? playerDetails.gender : 'Unknown',
          phone_number: playerDetails ? playerDetails.phone_number : 'Unknown',
          paid: playerDetails ? bp.paid : false,
          supabase_id: playerDetails ? playerDetails.supabase_id : 'Unknown',
        }
      })

      return playersInBracketDetailed as unknown as BracketPlayer[]
    },
  })

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const { data: bracketStatus } = useQuery<string>({
    queryKey: ['bracketStatus', bracketId],
    queryFn: async () => {
      if (!bracketId) return MatchupStatus.PENDING
      return (await getBracketStatus(bracketId)) as unknown as string
    },
    enabled: !!bracketId,
  })

  const isTournamentStarted =
    bracketStatus !== undefined && bracketStatus !== MatchupStatus.PENDING

  const addPlayerMutation = useMutation<void, Error, { playerId: number }>({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      await addPlayerToBracket(playerId, bracketId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', isAdmin!, allPlayers.length, bracketId],
      })
      queryClient.invalidateQueries({
        queryKey: ['rounds', bracketId],
      })
      queryClient.invalidateQueries({
        queryKey: ['availableRounds', bracketId],
      })
      setSelectedPlayer(null)
      showAlert('Player added to bracket', 'success')
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to add player'),
  })

  const removePlayerMutation = useMutation<void, Error, { playerId: number }>({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      await removePlayerFromBracket(playerId, bracketId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', isAdmin!, allPlayers.length, bracketId],
      })
      setSelectedPlayer(null)
      showAlert('Player removed from bracket', 'info')
    },
    onError: (e: Error) =>
      showAlert(e.message, 'error', 'Failed to remove player'),
  })
  const isLoading = addPlayerMutation.status === 'pending'

  const handlePlayerChange = (_: unknown, newValue: Player | null) => {
    setSelectedPlayer(newValue)
  }

  const handleAddPlayer = () => {
    if (selectedPlayer) {
      addPlayerMutation.mutate({ playerId: selectedPlayer.id })
    }
  }

  const handleAddSelf = async () => {
    console.log('Current user:', user)
    if (user) {
      const player = allPlayers.find((p) => p.supabase_id === user.id)
      const isPlayerInBracket = playersInBracket.some(
        (p) => p.supabase_id === user.id,
      )
      if (player) {
        if (isPlayerInBracket) {
          await removePlayerMutation.mutate({ playerId: player.id })
        } else {
          await addPlayerMutation.mutate({ playerId: player.id })
        }
      } else {
        navigate({
          to: '/login',
          search: () => ({
            redirect: `/tournaments/${tournamentId}?bracketId=${bracketId}`,
          }),
        })
      }
    }
  }

  const availablePlayers = allPlayers.filter(
    (player) =>
      !(playersInBracket as BracketPlayer[]).some(
        (p) => p.player_id === player.id || player.id === 0,
      ),
  )

  const commonColumns: GridColDef<BracketPlayer>[] = [
    { field: 'name', headerName: 'Player Name', width: 300 },
    { field: 'gender', headerName: 'Gender', width: 150 },
  ]

  const actionColumn: GridColDef<BracketPlayer> = {
    field: 'action',
    headerName: 'Remove from Bracket',
    sortable: false,
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    renderCell: (params) => {
      const onClick = async (e: { stopPropagation: () => void }) => {
        e.stopPropagation() // don't select this row after clicking

        const thisPlayer = params.row as BracketPlayer
        if (!isAdmin) {
          showAlert(
            'You must be an admin to remove players from the bracket.',
            'warning',
          )
          return
        }

        await removePlayerMutation.mutate({
          playerId: thisPlayer.player_id as number,
        })
      }

      return (
        <Button onClick={onClick}>
          <DeleteIcon color="error" />
        </Button>
      )
    },
  }

  const columns: GridColDef<BracketPlayer>[] = isAdmin
    ? [
        ...commonColumns,
        {
          field: 'phone_number',
          headerName: 'Phone Number',
          width: 200,
        },
        { field: 'paid', headerName: 'Paid', width: 100, type: 'boolean' },
        actionColumn,
      ]
    : ([...commonColumns, actionColumn] as GridColDef<BracketPlayer>[])

  if (!isLoaded) {
    return <Loader />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'stretch',
      }}
    >
      <div style={{ flex: 2, height: 400, marginBottom: '1rem' }}>
        <DataGrid
          rows={playersInBracket}
          columns={columns}
          pageSizeOptions={[5]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          sx={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'var(--color-header-bg)',
              color: 'var(--color-header-text)',
            },
            '& .MuiDataGrid-columnHeader .MuiSvgIcon-root': {
              color: 'var(--color-header-bg)',
              fill: 'var(--color-primary-contrast)',
            },
            '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
              color: 'var(--color-header-text)',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: 'var(--color-surface-2)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'var(--color-surface-2) !important',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-footerContainer .MuiIconButton-root': {
              color: 'var(--color-text)',
            },
            '& .MuiTablePagination-root': {
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-filler': {
              backgroundColor: 'var(--color-surface)',
            },
          }}
        />
      </div>

      {!isAdmin && isSignedIn && user && !!tournamentId && !!bracketId && (
        <Tooltip
          title={
            isTournamentStarted &&
            !playersInBracket.some((p) => p.supabase_id === user.id)
              ? 'Registration is closed — the tournament has already started'
              : ''
          }
        >
          <span style={{ width: '60%', margin: '0 auto' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddSelf}
              style={{ flex: 1, width: '100%' }}
              disabled={
                isTournamentStarted &&
                !playersInBracket.some((p) => p.supabase_id === user.id)
              }
            >
              {playersInBracket.some((p) => p.supabase_id === user.id)
                ? 'Remove yourself from this bracket'
                : 'Sign up for this bracket'}
            </Button>
          </span>
        </Tooltip>
      )}

      {isAdmin && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            gap: '1rem',
          }}
        >
          <Autocomplete
            options={availablePlayers}
            getOptionLabel={(option) => option.name}
            value={selectedPlayer}
            onChange={handlePlayerChange}
            style={{ marginBottom: '1rem', flex: 1 }}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  '& .MuiAutocomplete-option:hover': {
                    backgroundColor: 'var(--color-surface-2)',
                  },
                  '& .MuiAutocomplete-option[aria-selected="true"]': {
                    backgroundColor:
                      'color-mix(in srgb, var(--color-primary) 20%, var(--color-surface))',
                  },
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Player"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-surface)',
                    '& fieldset': { borderColor: 'var(--color-border)' },
                    '&:hover fieldset': { borderColor: 'var(--color-primary)' },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary)',
                    },
                  },
                  '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--color-primary)',
                  },
                  '& .MuiSvgIcon-root': { color: 'var(--color-text)' },
                }}
              />
            )}
          />

          {
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPlayer}
              disabled={!selectedPlayer || isLoading}
              style={{ marginBottom: '1rem', flex: 1 }}
            >
              Add Player
            </Button>
          }
        </div>
      )}
    </div>
  )
}

// Utility function to format phone numbers
const formatPhoneNumber = (phoneNumber: string): string => {
  const match = phoneNumber.match(/\+(\d)(\d{3})(\d{3})(\d{4})/)
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
  }
  return phoneNumber // Return the original if it doesn't match the expected format
}

export default BracketPlayersTable
