import { createFileRoute } from '@tanstack/react-router';
import TournamentDropdown from '../components/TournamentDropdown';
import BracketDropdown from '../components/BracketDropdown';
import { useState } from 'react';
import BracketPlayersTable from '../components/BracketPlayersTable';
import BracketMatchups from '../components/BracketMatchups';

export const Route = createFileRoute("/tournaments")({
  component: Tournaments,
})


function Tournaments() {
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [selectedBracket, setSelectedBracket] = useState<number | null>(null);

  const handleTournamentChange = (tournamentId: number | null) => {
    setSelectedTournament(tournamentId);
    setSelectedBracket(null); // Reset the selected bracket when the tournament changes
  };

  return (
    <div style={{ padding: '2rem', position: 'absolute', top: 0, left: '10%', width: '80%' }}>
      <h1>Local Leagues</h1>
      <p>Join our local tennis leagues to compete, have fun, and connect with other players in your community.</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <TournamentDropdown
            selectedTournament={selectedTournament}
            onTournamentChange={handleTournamentChange}
          />
        </div>
        <div style={{ flex: 1 }}>
          <BracketDropdown
            selectedTournament={selectedTournament}
            selectedBracket={selectedBracket}
            onBracketChange={setSelectedBracket}
            disabled={!selectedTournament}
          />
        </div>
      </div>
      <BracketPlayersTable bracketId={selectedBracket} />
      <BracketMatchups bracketId={selectedBracket} />
    </div>
  );
}

export default Tournaments;
