import React, { useState } from 'react';
import axios from 'axios';

const SkillForm = () => {
    const [skills, setSkills] = useState('');
    const [additionalSkills, setAdditionalSkills] = useState('');
    const [numOutputs, setNumOutputs] = useState(5);  // Default number of outputs to 5
    const [results, setResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/predict', {
                skills: skills.split(',').map(skill => skill.trim()),
                additionalSkills: additionalSkills ? additionalSkills.split(',').map(skill => skill.trim()) : [],
                n: parseInt(numOutputs, 10)  // Convert numOutputs to an integer
            });
            setResults(response.data);
        } catch (error) {
            console.error("There was an error making the request", error);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Skills</label>
                    <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="e.g., Python, Java, SQL"
                    />
                </div>
                <div>
                    <label className="block font-medium">Prospective Skills (Optional)</label>
                    <input
                        type="text"
                        value={additionalSkills}
                        onChange={(e) => setAdditionalSkills(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="e.g., HTML, React"
                    />
                </div>
                <div>
                    <label className="block font-medium">Number of Job Titles</label>
                    <input
                        type="number"
                        value={numOutputs}
                        onChange={(e) => setNumOutputs(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        min="1"
                        placeholder="e.g., 5"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                >
                    Predict Job Titles
                </button>
            </form>
            {results.length > 0 && (
                <div className="mt-6">
                    {results.map((result, index) => (
                        <div key={index} className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h2 className="text-lg font-semibold">Predicted Job Title: {result.jobTitle}</h2>
                            <div>
                                <h3 className="font-medium">Matched Skills:</h3>
                                <ul className="list-disc list-inside ml-4">
                                    {result.matchedSkills.map((skill, idx) => (
                                        <li key={idx}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                            {result.missingSkills.length === 0 ? (
                                <div>
                                    <h3 className="font-medium">Badge Received</h3>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-medium">Missing skills:</h3>
                                    <ul className="list-disc list-inside ml-4">
                                        {result.missingSkills.map((skill, idx) => (
                                            <li key={idx}>{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillForm;
