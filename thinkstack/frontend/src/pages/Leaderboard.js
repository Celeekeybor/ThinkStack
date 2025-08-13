import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaderboard');
        setEntries(res.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Leaderboard</h1>

      {loading ? (
        <p>Loading leaderboard...</p>
      ) : entries.length === 0 ? (
        <p>No leaderboard entries found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped shadow-sm">
            <thead className="thead-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">User</th>
                <th scope="col">Score</th>
                <th scope="col">Challenges Completed</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{entry.user_name}</td>
                  <td>{entry.score}</td>
                  <td>{entry.challenges_completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
