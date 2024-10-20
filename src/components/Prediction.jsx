import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Prediction() {
  const location = useLocation();
  const { selectedSkills } = location.state || {}; 
  const [results, setResults] = useState([]);  // Store predicted results
  const [error, setError] = useState(null);  // For error handling

  // Function to fetch predictions automatically
  const fetchPrediction = async () => {
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        skills: selectedSkills,  // Send selected skills array
        n: 3  // Fetch 3 predictions (main + 2 additional)
      });

      setResults(response.data);  // Update results with the response data
    } catch (error) {
      console.error("Error occurred during the request:", error);
      setError('Something went wrong while fetching the prediction.');
    }
  };

  // Automatically predict on component mount
  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchPrediction();  // Fetch predictions
    }
  }, [selectedSkills]);

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1 className='text-white font-semibold text-2xl mb-4'>
        You are a few steps behind from becoming a
      </h1>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 w-full max-w-md">
        {results.length > 0 ? (
          <>
            {/* Main Job Title */}
            <div className="bg-lime-50 p-4 rounded-md mb-6">
              <h2 className="text-indigo-500 font-bold text-4xl mb-2">{results[0].jobTitle}</h2>
              <p><strong>Current Skills:</strong> {results[0].matchedSkills.join(', ')}</p>
              <p><strong>Missing Skills:</strong> {results[0].missingSkills.join(', ')}</p>
            </div>

            {/* Additional Job Titles */}
            <h3 className="text-white font-semibold text-m mb-4">Additional Roles Based On Your Skills</h3>
            {results.slice(1, 3).map((result, index) => (
              <div key={index} className="bg-slate-100 p-4 rounded-md mb-4">
                <h3 className="text-indigo-500 font-bold text-2xl">{result.jobTitle}</h3>
                <p><strong>Current Skills:</strong> {result.matchedSkills.join(', ')}</p>
                <p><strong>Missing Skills:</strong> {result.missingSkills.join(', ')}</p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-white">Fetching job titles, please wait...</p>
        )}
      </div>
    </div>
  );
}

export default Prediction;
