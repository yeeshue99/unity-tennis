import React from 'react'
import {
  FormControl,
  InputLabel,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material'
import { ThemedSelect } from '@/components/ThemedSelect'
import { useQuery } from '@tanstack/react-query'
import { fetchBracketsForTournament } from '@/db/brackets'

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

      const response = await fetchBracketsForTournament(selectedTournament)

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
    <ThemedSelect
      labelId="bracket-dropdown-label"
      id="bracket-dropdown"
      value={selectedBracket}
      label="Select a Bracket"
      // @ts-expect-error TS2322: ThemedSelect onChange type doesn't match SelectChangeEvent<number|null>
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
    </ThemedSelect>
  )
}

export default BracketDropdown
