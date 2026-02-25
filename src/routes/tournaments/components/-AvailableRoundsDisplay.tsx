import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAvailableRoundsForBracket } from '@/db/matchups'
import { Box, Chip, Skeleton, Tooltip, Typography } from '@mui/material'
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
    queryKey: ['availableRounds', bracketId],
    queryFn: async () => {
      if (!bracketId) return []
      return getAvailableRoundsForBracket(bracketId)
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

  const isEmpty = availableRounds.length === 0

  return (
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
        minWidth: '130px',
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
            color: isEmpty ? 'var(--color-text-muted)' : 'var(--color-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {isEmpty ? '—' : 'Active Rounds'}
        </Typography>
      </Box>
      {isEmpty ? (
        <Typography
          variant="caption"
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.1,
          }}
        >
          No rounds played
        </Typography>
      ) : (
        <Box
          style={{
            display: 'flex',
            gap: '3px',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          {availableRounds.map((round) => (
            <Tooltip key={round} title={`Round ${round}`} arrow placement="top">
              <Chip
                label={`R${round}`}
                size="small"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--color-primary) 20%, var(--color-surface))',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: '20px',
                }}
              />
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default AvailableRoundsDisplay
