import requests

# Define the endpoint and headers
url = "https://leetcode.com/graphql"
headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"  
}

username = "suchz2004"
data = {
    "query": """
    query userProblemsSolved($username: String!) {
        allQuestionsCount {
            difficulty
            count
        }
        matchedUser(username: $username) {
            problemsSolvedBeatsStats {
                difficulty
                percentage
            }
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }
    """,
    "variables": {
        "username": username
    }
}

response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    response_data = response.json()

    # Extract necessary details
    total_solved = next(item['count'] for item in response_data['data']['matchedUser']['submitStatsGlobal']['acSubmissionNum'] if item['difficulty'] == 'All')
    easy_solved = next(item['count'] for item in response_data['data']['matchedUser']['submitStatsGlobal']['acSubmissionNum'] if item['difficulty'] == 'Easy')
    medium_solved = next(item['count'] for item in response_data['data']['matchedUser']['submitStatsGlobal']['acSubmissionNum'] if item['difficulty'] == 'Medium')
    hard_solved = next(item['count'] for item in response_data['data']['matchedUser']['submitStatsGlobal']['acSubmissionNum'] if item['difficulty'] == 'Hard')

    output = f"""
    The User: {username}
    solved {total_solved} problems. The category count is:
    Easy: {easy_solved}
    Medium: {medium_solved}
    Hard: {hard_solved}
    """

    print(output)

else:
    print(f"Error {response.status_code}: {response.text}")