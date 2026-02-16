import React from 'react'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { fetchBracketsForTournament } from '@/db/brackets'
import { useSession } from '@clerk/clerk-react'

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

const BracketDropdown: React.FC<BracketDropdownProps> = ({
  selectedTournament,
  selectedBracket,
  onBracketChange,
  disabled,
}) => {
  const { session } = useSession()

  const {
    data: brackets = [],
    isLoading,
    isError,
  } = useQuery<Bracket[], Error>({
    queryKey: ['brackets', selectedTournament],
    queryFn: async () => {
      if (!selectedTournament) {
        return []
      }

      const response = await fetchBracketsForTournament(
        await session?.getToken(),
        selectedTournament,
      )

      return response as unknown as Bracket[]
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
