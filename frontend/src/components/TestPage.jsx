import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function TestPage({ profile }) {
  const [untestedSkills, setUntestedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  if (!profile) profile = JSON.parse(localStorage.getItem("profile"));
  const profileId = profile?.id || "";

  useEffect(() => {
    const fetchUntestedSkills = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setUntestedSkills(data.skills.filter(skill => !data.testedSkills.some(tested => tested.skill === skill)));
        } else {
          console.error("Failed to fetch untested skills");
        }
      } catch (error) {
        console.error("Error fetching untested skills:", error);
        setError("Error fetching untested skills.");
      }
    };

    if (profileId) {
      fetchUntestedSkills();
    }
  }, [profileId]);

  const geminiApiKey = import.meta.env.VITE_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
    setQuestions([]);
    setAnswers({});
    setScore(null);
  };

  const fetchQuestions = async () => {
    if (!selectedSkill) {
      setError("Please select a skill.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setScore(null);

    try {
      const prompt = `Generate 5 intermediate level multiple choice questions on ${selectedSkill} as a JSON object. Each question should have a 'question', 'options', and 'answer'. Respond only with JSON without any extra whitespace.`;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      // Attempt to parse the response text to JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON format in response");
      }

      const data = JSON.parse(jsonMatch[0]);

      if (!data || !data.questions) {
        throw new Error("Invalid data structure received from Gemini API");
      }

      setQuestions(data.questions);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again later.");
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchQuestions, 1000); // Retry after 1 second
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  const calculateScore = async () => {
    if (!questions.length) return;

    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);

    try {
      const response = await fetch(`http://localhost:8080/profile/skills/tested`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          testedSkill: {
            skill: selectedSkill,
            dateTested: new Date(),
            score: correctCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tested skill in the database");
      }
      console.log("Tested skill updated successfully");
    } catch (error) {
      console.error("Error updating tested skill:", error);
    }
  };

  // Validate profileId before making API calls
  if (!profileId) {
    return <p>Error: Profile not found.</p>;
  }

  return (
    <div className="container mx-auto mt-8 p-6 max-w-4xl bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
        Pending test for user
      </h2>

      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Select a skill:
        </label>
        <select
          value={selectedSkill}
          onChange={handleSkillChange}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">-- Choose a skill --</option>
          {untestedSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={fetchQuestions}
        className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
        disabled={isLoading || !selectedSkill}
      >
        {isLoading ? "Generating Questions..." : "Start Test"}
      </button>

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}

      {questions.length > 0 && score === null && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold text-green-600 mb-4">
            Questions for {selectedSkill}
          </h3>

          <form>
            {questions.map((question, index) => (
              <div key={index} className="mb-6">
                <p className="text-lg font-medium text-gray-800 mb-2">
                  {index + 1}. {question.question}
                </p>
                <div>
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="block text-gray-700 mb-1">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </form>

          <button
            onClick={calculateScore}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Submit Answers
          </button>
        </div>
      )}

      {score !== null && (
        <p className="text-xl font-bold text-center text-green-600 mt-4">
          Your Score: {score} / {questions.length}
        </p>
      )}
    </div>
  );
}

export default TestPage;
