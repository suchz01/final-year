import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

function SkillsAdd({ profile }) {
  if (!profile) profile = JSON.parse(localStorage.getItem("profile"));
  const profileId = profile?.id || "";

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrings, setSelectedStrings] = useState([]);
  
  useEffect(() => {
    // Fetch skills and update state
    const fetchSkills = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedStrings(data.skills || []); // Set skills from fetched data
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchSkills();
  }, [profileId]);

  const [availableStrings, setAvailableStrings] = useState([]);
  const [filteredStrings, setFilteredStrings] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Load skills.csv
    Papa.parse('/skills.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const skills = results.data.reduce((acc, row) => {
          if (row['Skills_Required']) {
            acc.push(...row['Skills_Required'].split(',').map(skill => skill.trim()));
          }
          return acc;
        }, []);
        const uniqueSkills = [...new Set(skills)];
        setAvailableStrings(uniqueSkills);
        setFilteredStrings(uniqueSkills);
      },
      error: (error) => {
        console.error('Error fetching CSV:', error);
      }
    });
  }, []);

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (!term) {
        setFilteredStrings(availableStrings);
        return;
      }

      const lowerTerm = term.toLowerCase();
      const matchScore = (str) => {
        const lowerStr = str.toLowerCase();
        return lowerStr.startsWith(lowerTerm) ? 3 : lowerStr.includes(lowerTerm) ? 2 : 1;
      };

      const matches = availableStrings
        .map(string => ({ string, score: matchScore(string) }))
        .filter(({ score }) => score > 1)
        .sort((a, b) => b.score - a.score || a.string.localeCompare(b.string))
        .map(({ string }) => string);

      setFilteredStrings(matches);
    }, 300),
    [availableStrings]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const updateDatabase = async (updatedSkills) => {
    if (!profileId) {
      console.error('Profile ID is missing');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/profile/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profileId, value: updatedSkills }),
      });

      if (!response.ok) throw new Error(`Failed to update skills: ${response.statusText}`);
      const data = await response.json();
      console.log('Skills updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating skills:', error);
      return null;
    }
  };

  const handleSelect = (string) => {
    if (!selectedStrings.includes(string)) {
      const updatedSkills = [...selectedStrings, string];
      setSelectedStrings(updatedSkills);
      updateDatabase(updatedSkills); // Update database after selecting a skill
    }
    setSearchTerm('');
    setFilteredStrings(availableStrings);
    setIsFocused(false);
  };

  const handleDeselect = async (string) => {
    const updatedSkills = selectedStrings.filter((s) => s !== string);
    setSelectedStrings(updatedSkills);
    const data = await updateDatabase(updatedSkills); // Update database after deselecting a skill
    if (!data) {
      console.error("Error updating skills in the database.");
    }
  };

  const handleContinue = async () => {
    const data = await updateDatabase(selectedStrings); // Update database with selected skills
    if (data) {
      navigate('/Prediction', { state: { selectedSkills: selectedStrings } });
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-900 px-4'>
      <div className='flex flex-col items-center justify-center w-full max-w-4xl bg-slate-900 rounded-lg p-6'>
        <h1 className='font-semibold text-xl text-lime-500 sm:text-2xl md:text-4xl lg:text-7xl mb-6 text-center'>Enter Your Skills</h1>
        <div className='w-full flex justify-center'>
          <input
            type="text"
            placeholder='Add Your Skills...'
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className='w-full max-w-xs md:max-w-lg p-2 rounded-md bg-gray-50 text-green-800 border-2 border-indigo-300 focus:outline-none focus:border-indigo-500'
          />
        </div>
        {(searchTerm || isFocused) && (
          <div className='w-full flex justify-center'>
            <ul className='bg-lime-50 border mt-2 shadow-md rounded-md max-h-48 overflow-y-auto w-full max-w-xs md:max-w-lg'>
              {filteredStrings.map((string, index) => (
                <li
                  key={index}
                  onMouseDown={() => handleSelect(string)}
                  className='p-2 cursor-pointer hover:bg-gray-100 border-b last:border-none'
                >
                  {string}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className='mt-4 flex flex-wrap justify-center w-full max-w-xs md:max-w-lg'>
          {selectedStrings.map((string, index) => (
            <div key={index} className='flex items-center m-1 p-2 bg-lime-100 rounded'>
              <span>{string}</span>
              <FaTimes className='ml-2 text-red-500 cursor-pointer' onClick={() => handleDeselect(string)} />
            </div>
          ))}
        </div>
        <div
          onClick={handleContinue}
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
          <span className="relative w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white">Continue</span>
        </div>
      </div>
    </div>
  );
}

export default SkillsAdd;
