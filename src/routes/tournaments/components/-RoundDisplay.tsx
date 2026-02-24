import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRoundsForBracket } from '@/db/matchups'
import { getBracketStatus } from '@/db/brackets'
import { Box, Skeleton, Tooltip, Typography } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SportsIcon from '@mui/icons-material/Sports'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

interface RoundDisplayProps {
  tournamentId: number | null
  bracketId: number | null
  style?: React.CSSProperties
}

const RoundDisplay: React.FC<RoundDisplayProps> = ({ bracketId, style }) => {
  const { data: rounds = [], isLoading: roundsLoading } = useQuery<number[]>({
    queryKey: ['rounds', bracketId],
    queryFn: async () => {
      if (!bracketId) return []
      const response = await getRoundsForBracket(bracketId)
      return response as unknown as number[]
    },
    enabled: !!bracketId,
  })

  const { data: status = 'PENDING', isLoading: statusLoading } =
    useQuery<string>({
      queryKey: ['bracketStatus', bracketId],
      queryFn: async () => {
        if (!bracketId) return 'PENDING'
        return getBracketStatus(bracketId)
      },
      enabled: !!bracketId,
    })

  if (!bracketId) {
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '56px',
          ...style,
        }}
      >
        <Typography
          variant="caption"
          style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}
        >
          No bracket
        </Typography>
      </Box>
    )
  }

  if (roundsLoading || statusLoading) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', ...style }}>
        <Skeleton variant="rounded" width="100%" height={56} />
      </Box>
    )
  }

  const currentRound = rounds.length > 0 ? Math.min(...rounds) : null
  const totalRounds = status === 'PENDING' ? rounds.length : (currentRound ?? 0)

  type StatusConfig = {
    icon: React.ReactNode
    label: string
    sublabel: string
    borderColor: string
    bgColor: string
    iconColor: string
    textColor: string
    tooltip: string
  }

  const getConfig = (): StatusConfig => {
    if (status === 'COMPLETED') {
      return {
        icon: <EmojiEventsIcon fontSize="small" />,
        label: 'Completed',
        sublabel: 'Tournament over',
        borderColor: '#2e7d32',
        bgColor: 'rgba(46, 125, 50, 0.08)',
        iconColor: '#2e7d32',
        textColor: '#2e7d32',
        tooltip: 'This bracket has finished',
      }
    }

    if (status === 'PENDING') {
      return {
        icon: <HourglassEmptyIcon fontSize="small" />,
        label: 'Not Started',
        sublabel: totalRounds > 0 ? `${totalRounds} rounds` : 'Pending setup',
        borderColor: 'var(--color-border)',
        bgColor: 'var(--color-surface-2)',
        iconColor: 'var(--color-text-muted)',
        textColor: 'var(--color-text-muted)',
        tooltip: 'Tournament has not started yet',
      }
    }

    // Active / IN_PROGRESS
    return {
      icon: <SportsIcon fontSize="small" />,
      label: currentRound !== null ? `Round ${currentRound}` : 'In Progress',
      sublabel: 'Current round',
      borderColor: 'var(--color-primary)',
      bgColor: 'rgba(51, 153, 102, 0.08)',
      iconColor: 'var(--color-primary)',
      textColor: 'var(--color-primary)',
      tooltip:
        currentRound !== null
          ? `Currently playing Round ${currentRound}`
          : 'Tournament is in progress',
    }
  }

  const config = getConfig()

  return (
    <Tooltip title={config.tooltip} arrow placement="top">
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '56px',
          borderRadius: '8px',
          border: `1.5px solid ${config.borderColor}`,
          background: config.bgColor,
          padding: '0 1rem',
          gap: '1px',
          cursor: 'default',
          transition: 'box-shadow 0.2s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          ...style,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: config.iconColor,
          }}
        >
          {config.icon}
          <Typography
            variant="body2"
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              lineHeight: 1.2,
              color: config.textColor,
              whiteSpace: 'nowrap',
            }}
          >
            {config.label}
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
          {config.sublabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default RoundDisplay
