import React from 'react'
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined'

interface ScoreModalProps {
  isOpen: boolean
  selectedMatchup: { id: number } | null
  onClose: () => void
  onSave: (score: string) => void
}

const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  selectedMatchup,
  onClose,
  onSave,
}) => {
  if (!isOpen || !selectedMatchup) return null

  const handleSave = () => {
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

    onSave(
      setScore2
        ? `${setScore1}-${setScore2}/${setScore3}-${setScore4}/${setScore5}-${setScore6}`
        : `${setScore1}-${setScore2}/${setScore3}-${setScore4}`,
    )
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
          backgroundColor: 'white',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
              flex: '3',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
              flex: '3',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
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
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ccc',
              color: 'black',
              border: 'none',
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
              backgroundColor: '#007bff',
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
