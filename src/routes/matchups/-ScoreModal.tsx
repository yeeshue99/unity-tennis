import React, { useState } from 'react'
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined'

interface ScoreModalProps {
  isOpen: boolean
  selectedMatchup: any | null
  onClose: () => void
  onSave: (score: string, winnerId?: number) => void
}

const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  selectedMatchup,
  onClose,
  onSave,
}) => {
  if (!isOpen || !selectedMatchup) return null

  const [selectedWinner, setSelectedWinner] = useState<number | null>(null)

  const getPlayerId = (side: 'player1' | 'player2') =>
    selectedMatchup?.[`${side}_id`] ?? selectedMatchup?.[side]?.id

  const getPlayerName = (side: 'player1' | 'player2') =>
    selectedMatchup?.[side]?.name ??
    (side === 'player1' ? 'Player 1' : 'Player 2')

  const toggleWinner = (playerId?: number) => {
    if (!playerId) return
    setSelectedWinner((prev) => (prev === playerId ? null : playerId))
  }

  const handleSave = () => {
    if (!selectedWinner) {
      alert('Please select a winner before saving the score.')
      return
    }

    const setScore1 = (
      document.getElementById('set-score-1') as HTMLInputElement
    )?.value
    const setScore2 = (
      document.getElementById('set-score-2') as HTMLInputElement
    )?.value
    const setScore3 = (
      document.getElementById('set-score-3') as HTMLInputElement
    )?.value
    const setScore4 = (
      document.getElementById('set-score-4') as HTMLInputElement
    )?.value
    const setScore5 = (
      document.getElementById('set-score-5') as HTMLInputElement
    )?.value
    const setScore6 = (
      document.getElementById('set-score-6') as HTMLInputElement
    )?.value

    const scoreString =
      setScore5 && setScore6
        ? `${setScore1}-${setScore2}/${setScore3}-${setScore4}/${setScore5}-${setScore6}`
        : `${setScore1}-${setScore2}/${setScore3}-${setScore4}`

    onSave(scoreString, selectedWinner ?? undefined)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          padding: '2rem',
          borderRadius: '8px',
          width: '600px',
          textAlign: 'center',
        }}
      >
        <h3 className="text-xl font-bold mb-4">
          Set Score for Matchup {selectedMatchup.id}
        </h3>
        <h4 className="mb-4">
          Input the score from the perspective of the winner
        </h4>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type="checkbox"
              checked={selectedWinner === getPlayerId('player1')}
              onChange={() => toggleWinner(getPlayerId('player1'))}
            />
            {getPlayerName('player1')}
          </label>

          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type="checkbox"
              checked={selectedWinner === getPlayerId('player2')}
              onChange={() => toggleWinner(getPlayerId('player2'))}
            />
            {getPlayerName('player2')}
          </label>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 2fr',
            gap: '1rem',
          }}
        >
          <input
            id="set-score-1"
            type="text"
            placeholder="Enter Set 1 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              flex: '3',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <HorizontalRuleOutlinedIcon className="mx-auto my-2.5" />
          <input
            id="set-score-2"
            type="text"
            placeholder="Enter Set 2 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              flex: '3',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <input
            id="set-score-3"
            type="text"
            placeholder="Enter Set 3 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <HorizontalRuleOutlinedIcon className="mx-auto my-2.5" />
          <input
            id="set-score-4"
            type="text"
            placeholder="Enter Set 4 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <input
            id="set-score-5"
            type="text"
            placeholder="Enter Set 5 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <HorizontalRuleOutlinedIcon className="mx-auto my-2.5" />
          <input
            id="set-score-6"
            type="text"
            placeholder="Enter Set 6 score"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScoreModal
