import React, { useState } from "react";
import { initialTeams, initialFixture } from "./data";

const App = () => {
  const [teams, setTeams] = useState(initialTeams);
  const [fixture, setFixture] = useState(initialFixture);

  const teamColors = teams.reduce((map, team) => {
    map[team.name] = team.color;
    return map;
  }, {});

  const groupedFixture = fixture.reduce((acc, match) => {
    acc[match.date] = acc[match.date] || [];
    acc[match.date].push(match);
    return acc;
  }, {});

  const updateResult = (matchId, result) => {
    const match = fixture.find((m) => m.id === matchId);
    if (!match) return;

    const updatedFixture = fixture.map((m) =>
      m.id === matchId ? { ...m, result } : m
    );

    // Revert previous points if result changes
    if (match.result) {
      revertPoints(match);
    }

    // Apply new result
    if (result === "1") {
      updatePoints(match.team1, 3); // Gana el equipo 1
      updateGamesPlayed(match.team1, match.team2);
    } else if (result === "2") {
      updatePoints(match.team2, 3); // Gana el equipo 2
      updateGamesPlayed(match.team1, match.team2);
    } else if (result === "X") {
      updatePoints(match.team1, 1); // Empate
      updatePoints(match.team2, 1);
      updateGamesPlayed(match.team1, match.team2);
    }

    setFixture(updatedFixture);
  };

  const updatePoints = (teamName, points) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.name === teamName
          ? { ...team, points: team.points + points }
          : team
      )
    );
  };

  const updateGamesPlayed = (team1, team2) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.name === team1 || team.name === team2) {
          return { ...team, played: team.played + 1 };
        }
        return team;
      })
    );
  };

  const revertPoints = (match) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.name === match.team1 || team.name === match.team2) {
          const revertPoints = match.result === "X" ? 1 : 3;
          return {
            ...team,
            points: team.points - revertPoints,
            played: team.played - 1,
          };
        }
        return team;
      })
    );
  };

  const resetData = () => {
    setTeams(initialTeams);
    setFixture(initialFixture);
  };

  return (
    <div className="app-container">
      <h1>Tabla de Posiciones</h1>
      <button onClick={resetData} className="reset-button">
        Reset
      </button>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Equipo</th>
            <th>Puntos</th>
            <th>Jugados</th>
          </tr>
        </thead>
        <tbody>
          {[...teams]
            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
            .map((team, index) => (
              <tr key={team.id}>
                <td>{index + 1}</td>
                <td style={{ color: team.color }}>{team.name}</td>
                <td>{team.points}</td>
                <td>{team.played}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2>Fixture</h2>
      {Object.entries(groupedFixture).map(([date, matches]) => (
        <div key={date}>
          <h3>Fecha: {date}</h3>
          <table className="fixture-table">
            <thead>
              <tr>
                <th>Partido</th>
                <th>Equipo 1</th>
                <th>Equipo 2</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td>{match.id}</td>
                  <td style={{ color: teamColors[match.team1] }}>{match.team1}</td>
                  <td style={{ color: teamColors[match.team2] }}>{match.team2}</td>
                  <td>
                    <select
                      value={match.result || ""}
                      onChange={(e) => updateResult(match.id, e.target.value)}
                      className="result-selector"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1">Gana {match.team1}</option>
                      <option value="X">Empatan</option>
                      <option value="2">Gana {match.team2}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default App;
