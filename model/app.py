from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.naive_bayes import MultinomialNB
import numpy as np
import warnings
from sklearn.exceptions import UndefinedMetricWarning

app = Flask(__name__)
CORS(app)

warnings.filterwarnings("ignore", category=UndefinedMetricWarning)

def suppress_label_warnings():
    warnings.filterwarnings(
        "ignore",
        message="Label not .* is present in all training examples",
        category=UserWarning
    )

suppress_label_warnings()

data = pd.read_csv("datasettttt.csv")

X = data['Skills Required']
y = data['Job Title'].str.split(', ')

job_title_to_skills = {}
for index, row in data.iterrows():
    job_title = row['Job Title']
    skills = set(skill.strip().lower() for skill in row['Skills Required'].split(','))
    if job_title not in job_title_to_skills:
        job_title_to_skills[job_title] = skills
    else:
        job_title_to_skills[job_title].update(skills)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(X)

mlb = MultiLabelBinarizer()
y = mlb.fit_transform(y)

labels_in_training = np.any(y, axis=0)
labels_to_use = mlb.classes_[labels_in_training]

y = y[:, labels_in_training]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4)

model = OneVsRestClassifier(MultinomialNB())
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

def predict_top_badges(user_input, include_skills=None, n=5):
    user_input_set = set(skill.strip().lower() for skill in user_input)
    user_input_text = ' '.join(user_input_set)
    user_input_vectorized = vectorizer.transform([user_input_text])
    probs = model.predict_proba(user_input_vectorized)[0]
    prob_list = probs
    top_indices = np.argsort(prob_list)[::-1]

    top_badges = [(labels_to_use[i], prob_list[i]) for i in top_indices]

    top_badges_dict = {}
    for badge, prob in top_badges:
        if badge not in top_badges_dict or top_badges_dict[badge] < prob:
            top_badges_dict[badge] = prob

    top_badges_sorted = sorted(top_badges_dict.items(), key=lambda x: x[1], reverse=True)

    top_badges_names = [badge for badge, _ in top_badges_sorted]

    skills_info = {}
    for badge in top_badges_names:
        required_skills = job_title_to_skills[badge]
        matched_skills = required_skills & user_input_set
        missing_skills = required_skills - user_input_set
        skills_info[badge] = {
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'missing_count': len(missing_skills),
            'matched_count': len(matched_skills)
        }

    if include_skills:
        include_skills_set = set(skill.strip().lower() for skill in include_skills)
        filtered_badges = []
        for badge in top_badges_names:
            if include_skills_set.issubset(skills_info[badge]['missing_skills']):
                filtered_badges.append(badge)
        top_badges_names = filtered_badges

    unique_predicted_badges = []
    seen_skills_sets = set()

    for badge in top_badges_names:
        if len(unique_predicted_badges) >= n:
            break
        required_skills = job_title_to_skills[badge]
        skills_tuple = tuple(sorted(required_skills))
        if skills_tuple not in seen_skills_sets:
            seen_skills_sets.add(skills_tuple)
            unique_predicted_badges.append(badge)

    if len(unique_predicted_badges) < n:
        for badge in top_badges_names:
            if len(unique_predicted_badges) >= n:
                break
            if badge not in unique_predicted_badges:
                unique_predicted_badges.append(badge)

    # Prioritize badges received (no missing skills) at the top
    unique_predicted_badges = sorted(
        unique_predicted_badges, 
        key=lambda badge: len(skills_info[badge]['missing_skills'])
    )

    return unique_predicted_badges, skills_info

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    skills = data.get('skills', [])
    additional_skills = data.get('additionalSkills', [])
    n = data.get('n', 5)
    predicted_badges, skills_info = predict_top_badges(skills, additional_skills if additional_skills else None, n)

    results = []
    for badge in predicted_badges:
        result = {
            "jobTitle": badge,
            "matchedSkills": list(skills_info[badge]['matched_skills']),
            "missingSkills": list(skills_info[badge]['missing_skills'])
        }
        results.append(result)

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
