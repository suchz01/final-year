import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Prediction() {
  const location = useLocation();
  const { selectedSkills = [] } = location.state || {}; // Ensure selectedSkills is always an array
  const [results, setResults] = useState([]); // Store predicted results
  const [matchedBadges, setMatchedBadges] = useState([]); // Store matched badges
  const [skill, setSkill] = useState({}); // Store skills for badges as an object
  const [error, setError] = useState(null); // For error handling
  const [loading, setLoading] = useState(false); // For loading state
  const [visibleCount, setVisibleCount] = useState(5); // Number of visible predictions

  const profile = JSON.parse(localStorage.getItem('profile'));
  const profileId = profile?.id || '';

  // Function to fetch predictions
  const fetchPrediction = async () => {
    try {
      setLoading(true);

      const response = await axios.post('http://localhost:5000/predict', {
        skills: selectedSkills,
        profileId,
        n: 100,
      });

      // Update states with fetched data
      setResults(response.data.results || []);
      setMatchedBadges(response.data.matchedBadges || []);
      setSkill(response.data.matched_skill || {}); // Ensure skill is an object

      setLoading(false);

      // Save badges if any matched
      if (response.data.matchedBadges?.length > 0) {
        await handleSaveBadges(response.data.matchedBadges, response.data.matched_skill);
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Failed to fetch prediction. Please try again later.');
      setLoading(false);
    }
  };

  // Automatically fetch predictions on component mount
  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchPrediction();
    }
  }, [selectedSkills]);

  // Save current goal
  const handleSaveGoal = async (jobTitle, matchedSkills, missingSkills) => {
    try {
      const response = await fetch(`http://localhost:8080/profile/currentGoal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          value: { role: jobTitle, skill: [...matchedSkills, ...missingSkills] },
        }),
      });

      if (!response.ok) throw new Error(`Failed to save current goal: ${response.statusText}`);
      const data = await response.json();
      console.log('Current goal saved successfully:', data);
      console.log('Current goal saved successfully!');
    } catch (error) {
      console.error('Error saving current goal:', error);
      console.log('Failed to save current goal.');
    }
  };

  // Save badges
  const handleSaveBadges = async (badges, skillData) => {
    try {
      const badgeObjects = badges
        .filter(badge => skillData[badge]) // Ensure skills exist for the badge
        .map(badge => ({
          name: badge,
          skills: skillData[badge] || [], // Use skillData for mapping
        }));

      console.log('Badge Objects:', badgeObjects); // Debugging log

      const response = await fetch(`http://localhost:8080/profile/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, value: badgeObjects }),
      });

      if (!response.ok) throw new Error(`Failed to save badges: ${response.statusText}`);
      const data = await response.json();
      console.log('Badges saved successfully:', data);
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  };

  // Handle "Load More" functionality
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 px-4 py-8 overflow-auto">
      <h1 className="text-white font-semibold text-2xl mb-4">
        You are a few steps behind from becoming a
      </h1>

      {/* Error message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Loading state */}
      {loading && <p className="text-white mt-4">Loading predictions...</p>}

      {/* No skills selected */}
      {!loading && selectedSkills.length === 0 && (
        <p className="text-white mt-4">Please select some skills to get predictions.</p>
      )}

      <div className="mt-8 w-full max-w-md">
        {results.length > 0 ? (
          <>
            {results.slice(0, visibleCount).map((result, index) => (
              <div
                key={index}
                className={`${
                  index === 0 ? 'bg-lime-50' : 'bg-slate-200'
                } p-4 rounded-md mb-4 relative`}
              >
                <h3
                  className={`text-indigo-500 font-bold ${
                    index === 0 ? 'text-4xl' : 'text-2xl'
                  }`}
                >
                  {result.jobTitle}
                </h3>
                <p>
                  <strong>Current Skills:</strong> {result.matchedSkills.join(', ')}
                </p>
                <p>
                  <strong>Missing Skills:</strong> {result.missingSkills.join(', ')}
                </p>
                <span
                  className="material-symbols-outlined absolute top-2 right-2 cursor-pointer"
                  onClick={() =>
                    handleSaveGoal(result.jobTitle, result.matchedSkills, result.missingSkills)
                  }
                >
                  keep
                </span>
              </div>
            ))}
            {visibleCount < results.length && (
              <div
                onClick={handleLoadMore}
                className="relative inline-flex items-center justify-center mt-10 py-3 pl-4 pr-12 overflow-hidden font-semibold text-indigo-500 transition-all duration-150 ease-in-out rounded-lg hover:pl-10 hover:pr-6 bg-white group cursor-pointer"
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-slate-900 group-hover:h-full border-lime-500 border-2"></span>
                <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
                <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                  <svg className="w-5 h- text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
                <span className="relative w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">Load More</span>
              </div>
            )}
          </>
        ) : (
          !loading && <p className="text-white">No predictions available. Please try again later.</p>
        )}
      </div>
    </div>
  );
}

export default Prediction;
