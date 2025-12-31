import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Autocomplete,
  Button,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

interface Player {
  id: number;
  name: string;
  phone_number: string;
  gender: string;
}

interface BracketPlayersTableProps {
  bracketId: number | null;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const BracketPlayersTable: React.FC<BracketPlayersTableProps> = ({ bracketId }) => {
  const queryClient = useQueryClient();

  const { data: playersInBracket = [] } = useQuery<Player[]>(
    {
      queryKey: ['bracketPlayers', bracketId],
      queryFn: async () => {
        if (!bracketId) return [];
        
        const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/players`);
        if (!response.ok) {
          throw new Error('Failed to fetch players in bracket');
        }

        return response.json();
      },
    }
  );

  const { data: allPlayers = [] } = useQuery<Player[]>(
    {
      queryKey: ['allPlayers'],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/players`);
        if (!response.ok) {
          throw new Error('Failed to fetch all players');
        }
        return response.json();
      },
    }
  );

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const addPlayerMutation = useMutation<void, Error, { playerId: number }>({
    mutationFn: async ({ playerId }: { playerId: number }) => {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_id: playerId }),
      });
      if (!response.ok) {
        throw new Error('Failed to add player to bracket');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracketPlayers', bracketId] });
      setSelectedPlayer(null);
    },
  });

  const isLoading = addPlayerMutation.status === 'pending';

  const handlePlayerChange = (_: unknown, newValue: Player | null) => {
    setSelectedPlayer(newValue);
  };

  const handleAddPlayer = () => {
    if (selectedPlayer) {
      addPlayerMutation.mutate({ playerId: selectedPlayer.id });
    }
  };

  const availablePlayers = allPlayers.filter(
    (player) => !playersInBracket.some((p) => p.id === player.id)
  );

  const columns = [
    { field: 'id', headerName: 'Player ID', width: 150 },
    { field: 'name', headerName: 'Player Name', width: 300 },
    { field: 'gender', headerName: 'Gender', width: 150 },
    { field: 'phone_number', headerName: 'Phone Number', width: 200 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
      <div style={{ flex: 2, height: 400 }}>
        <DataGrid
          rows={playersInBracket}
          columns={columns}
          pageSizeOptions={[5]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <Autocomplete
          options={availablePlayers}
          getOptionLabel={(option) => option.name}
          value={selectedPlayer}
          onChange={handlePlayerChange}
          renderInput={(params) => <TextField {...params} label="Add Player" variant="outlined" />}
          style={{ marginBottom: '1rem', flex: 1 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPlayer}
          disabled={!selectedPlayer || isLoading}
          style={{ marginBottom: '1rem', flex: 1 }}
        >
          Add Player
        </Button>
      </div>
    </div>
  );
};

export default BracketPlayersTable;
