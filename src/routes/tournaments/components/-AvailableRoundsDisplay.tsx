import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRoundsForBracket } from '@/db/matchups'
import { Box, Skeleton, Tooltip, Typography } from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'

interface AvailableRoundsDisplayProps {
  tournamentId: number | null
  bracketId: number | null
  style?: React.CSSProperties
}

const AvailableRoundsDisplay: React.FC<AvailableRoundsDisplayProps> = ({
  bracketId,
  style,
}) => {
  const { data: availableRounds = [], isLoading } = useQuery<number[]>({
    queryKey: ['rounds', bracketId],
    queryFn: async () => {
      if (!bracketId) return []
      return getRoundsForBracket(bracketId)
    },
    enabled: !!bracketId,
  })

  if (!bracketId) {
    return null
  }

  if (isLoading) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', ...style }}>
        <Skeleton variant="rounded" width="100%" height={56} />
      </Box>
    )
  }

  const maxRound =
    availableRounds.length > 0 ? Math.max(...availableRounds) : null

  const isEmpty = maxRound === null

  return (
    <Tooltip
      title={
        isEmpty
          ? 'No rounds have started yet'
          : `Highest active/completed round: ${maxRound}`
      }
      arrow
      placement="top"
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '56px',
          borderRadius: '8px',
          border: isEmpty
            ? '1.5px solid var(--color-border)'
            : '1.5px solid var(--color-primary)',
          background: isEmpty
            ? 'var(--color-surface-2)'
            : 'rgba(51, 153, 102, 0.08)',
          padding: '0 1rem',
          gap: '1px',
          cursor: 'default',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          ...style,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: isEmpty ? 'var(--color-text-muted)' : 'var(--color-primary)',
          }}
        >
          <LayersIcon fontSize="small" />
          <Typography
            variant="body2"
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              lineHeight: 1.2,
              color: isEmpty
                ? 'var(--color-text-muted)'
                : 'var(--color-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {isEmpty ? '—' : `Round ${maxRound}`}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.1,
          }}
        >
          {isEmpty ? 'No rounds played' : 'Highest round'}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default AvailableRoundsDisplay
