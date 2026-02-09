import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Autocomplete, Button, TextField } from '@mui/material'
import { DataGrid, GridApi, GridColDef, GridKeyValue } from '@mui/x-data-grid'
import { useAuth, useUser, useSession } from '@clerk/clerk-react'
import {
  addPlayerToBracket,
  fetchAllPlayers,
  fetchAllPlayersInBracket,
  removePlayerFromBracket,
} from '@/db/players'
import { decrypt } from '@/cryptography/cryptography'
import { Player, BracketPlayer } from '@/db/players'
import DeleteIcon from '@mui/icons-material/Delete'

interface BracketPlayersTableProps {
  bracketId: number | null
}

const BracketPlayersTable: React.FC<BracketPlayersTableProps> = ({
  bracketId,
}) => {
  const queryClient = useQueryClient()
  const { isSignedIn, user } = useUser()
  const { has } = useAuth()
  const canManage = has ? has({ role: 'org:admin' }) : false
  const { session } = useSession()
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
    queryKey: ['bracketPlayers', isAdmin, allPlayers.length, bracketId],
    queryFn: async () => {
      if (!bracketId) {
        return []
      }

      const response = await fetchAllPlayersInBracket(
        bracketId,
        await session?.getToken(),
      )
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
          clerk_id: playerDetails ? playerDetails.clerk_id : 'Unknown',
        }
      })

      return playersInBracketDetailed as unknown as BracketPlayer[]
    },
  })

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const addPlayerMutation = useMutation<void, Error, { playerId: number }>({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      await addPlayerToBracket(playerId, bracketId!, await session?.getToken())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', isAdmin, allPlayers.length, bracketId],
      })
      setSelectedPlayer(null)
    },
  })

  const removePlayerMutation = useMutation<void, Error, { playerId: number }>({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      await removePlayerFromBracket(
        playerId,
        bracketId!,
        await session?.getToken(),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bracketPlayers', isAdmin, allPlayers.length, bracketId],
      })
      setSelectedPlayer(null)
    },
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
    if (user) {
      const player = allPlayers.find((p) => p.clerk_id === user.id)
      const isPlayerInBracket = playersInBracket.some(
        (p) => p.clerk_id === user.id,
      )
      if (player) {
        if (isPlayerInBracket) {
          await removePlayerMutation.mutate({ playerId: player.id })
        } else {
          await addPlayerMutation.mutate({ playerId: player.id })
        }
      }
    }
  }

  const availablePlayers = allPlayers.filter(
    (player) =>
      !(playersInBracket as BracketPlayer[]).some(
        (p) => p.player_id === player.id,
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

        const api: GridApi = params.api
        const thisRow: Record<string, GridKeyValue> = {}
        const thisPlayer = params.row as BracketPlayer
        console.log('Attempting to remove player:', thisPlayer)
        if (!isAdmin) {
          alert('You must be an admin to remove players from the bracket.')
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
        />
      </div>

      {!isAdmin && isSignedIn && user && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddSelf}
          style={{ flex: 1, width: '60%', margin: '0 auto' }}
        >
          {playersInBracket.some((p) => p.clerk_id === user.id)
            ? 'Remove yourself from this bracket'
            : 'Sign up for this bracket'}
        </Button>
      )}

      {isAdmin && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <Autocomplete
            options={availablePlayers}
            getOptionLabel={(option) => option.name}
            value={selectedPlayer}
            onChange={handlePlayerChange}
            renderInput={(params) => (
              <TextField {...params} label="Add Player" variant="outlined" />
            )}
            style={{ marginBottom: '1rem', flex: 1 }}
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
