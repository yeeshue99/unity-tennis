import React from 'react'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'

interface BracketDropdownProps {
  selectedTournament: number | null
  selectedBracket: number | null
  onBracketChange: (bracketId: number | null) => void
  disabled: boolean
}

interface Bracket {
  id: number
  name: string
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const TEST_DATA: Bracket[] = [
  {
    id: 1,
    name: 'Yellow League',
  },
  {
    id: 2,
    name: 'Red League',
  },
  {
    id: 3,
    name: 'Blue League',
  },
  {
    id: 4,
    name: 'Green League',
  },
]

const BracketDropdown: React.FC<BracketDropdownProps> = ({
  selectedTournament,
  selectedBracket,
  onBracketChange,
  disabled,
}) => {
  const {
    data: brackets = [],
    isLoading,
    isError,
  } = useQuery<Bracket[], Error>({
    queryKey: ['brackets', selectedTournament],
    queryFn: async () => {
      // if (!selectedTournament) return []
      // const response = await fetch(
      //   `${API_BASE_URL}/tournaments/${selectedTournament}/brackets`,
      // )
      // if (!response.ok) {
      //   throw new Error('Network response was not ok')
      // }
      // return response.json()
      return TEST_DATA
    },
  })

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    onBracketChange(event.target.value as number | null)
  }

  if (isLoading) {
    return <div>Loading brackets...</div>
  }

  if (isError) {
    return <div>Error loading brackets. Please try again later.</div>
  }

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="bracket-dropdown-label">Select a Bracket</InputLabel>
      <Select
        labelId="bracket-dropdown-label"
        id="bracket-dropdown"
        value={selectedBracket}
        onChange={handleChange}
        style={{ marginBottom: '1rem' }}
      >
        <MenuItem value="">
          <em>-- Select --</em>
        </MenuItem>
        {brackets.map((bracket) => (
          <MenuItem key={bracket.id} value={bracket.id}>
            {bracket.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default BracketDropdown
