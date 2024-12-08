import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

function SkillsAdd() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrings, setSelectedStrings] = useState([]);
  const [availableStrings, setAvailableStrings] = useState([]);
  const [filteredStrings, setFilteredStrings] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/skills.csv`, {
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
      if (term === '') {
        setFilteredStrings(availableStrings); // Show all options when term is empty
        return;
      }

      const lowerTerm = term.toLowerCase();

      const matchScore = (str) => {
        const lowerStr = str.toLowerCase();
        if (lowerStr.startsWith(lowerTerm)) return 3;
        if (lowerStr.includes(lowerTerm)) return 2;
        return 1;
      };

      const matches = availableStrings
        .map(string => ({
          string,
          score: matchScore(string),
        }))
        .filter(({ score }) => score > 1)
        .sort((a, b) => b.score - a.score || a.string.localeCompare(b.string))
        .map(({ string }) => string);

      setFilteredStrings(matches);
    }, 300),
  );

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSelect = (string) => {
    if (!selectedStrings.includes(string)) {
      setSelectedStrings([...selectedStrings, string]);
    }
    setSearchTerm('');
    setFilteredStrings(availableStrings); // Reset to show all options
    setIsFocused(false); // Hide the dropdown after selection
  };

  const handleDeselect = (string) => {
    setSelectedStrings(selectedStrings.filter((s) => s !== string));
  };

  const handleContinue = () => {
    navigate('/Prediction', { state: { selectedSkills: selectedStrings } });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-900 px-4'>
      <div className='flex flex-col items-center justify-center w-full max-w-4xl bg-slate-900 rounded-lg p-6'>
        <h1 className='font-semibold text-xl text-lime-500 sm:text-2xl md:text-4xl lg:text-7xl mb-6 text-center'>Enter Your Skills</h1>
        
        {/* Centering search input */}
        <div className='w-full flex justify-center'>
          <input 
            type="text"
            placeholder='Add Your Skills...'
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)} // Set focus state to true
            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay closing dropdown after blur
            className='w-full max-w-xs md:max-w-lg p-2 rounded-md bg-gray-50 text-green-800 border-2 border-indigo-300 focus:outline-none focus:border-indigo-500'
          />
        </div>
        
        {/* Filtered results dropdown */}
        {(searchTerm || isFocused) && (
          <div className='w-full flex justify-center'>
            <ul className='bg-lime-50 border mt-2 shadow-md rounded-md max-h-48 overflow-y-auto w-full max-w-xs md:max-w-lg'>
              {filteredStrings.map((string, index) => (
                <li 
                  key={index} 
                  onMouseDown={() => handleSelect(string)} // Use onMouseDown to select before blur
                  className='p-2 cursor-pointer hover:bg-gray-100 border-b last:border-none'
                >
                  {string}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Selected skills */}
        <div className='mt-4 flex flex-wrap justify-center w-full max-w-xs md:max-w-lg'>
          {selectedStrings.map((string, index) => (
            <div key={index} className='flex items-center m-1 p-2 bg-lime-100 rounded'>
              <span>{string}</span>
              <FaTimes
                className='ml-2 text-red-500 cursor-pointer' 
                onClick={() => handleDeselect(string)}
              />                
            </div>
          ))}
        </div>

        {/* Continue button */}
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
