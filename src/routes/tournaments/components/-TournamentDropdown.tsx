import React from 'react'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { SelectChangeEvent } from '@mui/material'

interface Tournament {
  id: number
  name: string
}

interface TournamentDropdownProps {
  selectedTournament: number | null
  onTournamentChange: (tournamentId: number | null) => void
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const TEST_DATA: Tournament[] = [
  {
    id: 1,
    name: '2026 Adult League Jan',
  },
  {
    id: 2,
    name: '2026 Adult League Mar',
  },
  {
    id: 3,
    name: '2026 Adult League May',
  },
  // Add more tournaments as needed
]

const TournamentDropdown: React.FC<TournamentDropdownProps> = ({
  selectedTournament,
  onTournamentChange,
}) => {
  const {
    data: tournaments = [],
    isLoading,
    isError,
  } = useQuery<Tournament[], Error>({
    queryKey: ['tournaments'],
    queryFn: async () => {
      // const response = await fetch(`${API_BASE_URL}/tournaments`)
      // if (!response.ok) {
      //   throw new Error('Network response was not ok')
      // }
      // return response.json()
      return TEST_DATA
    },
  })

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    onTournamentChange(event.target.value as number | null)
  }

  if (isLoading) {
    return <div>Loading tournaments...</div>
  }

  if (isError) {
    return <div>Error loading tournaments. Please try again later.</div>
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="tournament-dropdown-label">
        Select a Tournament
      </InputLabel>
      <Select
        labelId="tournament-dropdown-label"
        id="tournament-dropdown"
        value={selectedTournament}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>-- Select --</em>
        </MenuItem>
        {tournaments.map((tournament: Tournament) => (
          <MenuItem key={tournament.id} value={tournament.id}>
            {tournament.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default TournamentDropdown
