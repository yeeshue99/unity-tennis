import React from 'react'
import { FormControl, InputLabel, MenuItem } from '@mui/material'
import { ThemedSelect } from '@/components/ThemedSelect'
import { useQuery } from '@tanstack/react-query'
import type { SelectChangeEvent } from '@mui/material'
import { fetchTournaments } from '@/db/tournaments'

interface Tournament {
  id: number
  name: string
}

interface TournamentDropdownProps {
  selectedTournament: number | null
  onTournamentChange: (tournamentId: number | null) => void
}

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
    queryFn: fetchTournaments as () => Promise<Tournament[]>,
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
    <ThemedSelect
      labelId="tournament-dropdown-label"
      id="tournament-dropdown"
      value={selectedTournament}
      label="Select a Tournament"
      // @ts-expect-error TS2322: ThemedSelect onChange type doesn't match SelectChangeEvent<number|null>
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
    </ThemedSelect>
  )
}

export default TournamentDropdown
