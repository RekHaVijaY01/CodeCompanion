from flask import Flask, request, jsonify
from flask_cors import CORS

from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import requests
from dotenv import load_dotenv
import os
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:5173"}})

bcrypt = Bcrypt(app)

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client['ai_code_explainer']
users = db['users']



# Signup Route
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    email = data["email"]
    username = data["username"]
    password = data["password"]

    if users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    users.insert_one({
        "email": email,
        "username": username,
        "password": hashed_pw
    })
    return jsonify({"message": "Signup successful"}), 201

# Login Route
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    user = users.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Login successful", "user": user["username"]}), 200

# Reset Password Route
@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data["email"]
    new_password = data["new_password"]

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Email not found"}), 404

    hashed_pw = bcrypt.generate_password_hash(new_password).decode("utf-8")
    users.update_one({"email": email}, {"$set": {"password": hashed_pw}})
    return jsonify({"message": "Password reset successful"}), 200






# for chatbot
TOGETHER_API_KEY = "6bb18024492392b379f837f747f90f2fd941a0b57021eb708fa68f96e62b7c6a"  # Replace this with your actual key

@app.route("/api/explain-output", methods=["POST"])
def explain_code_with_result():
    data = request.json
    code = data.get("code")
    output = data.get("output", "")
    language = data.get("language", "python")
   
   

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""Explain this {language} code:\n\n{code}\n\nAnd its output or error:\n\n{output}"""

    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [
            {"role": "system", "content": "You are an expert programmer. Explain the code and any output or error simply."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        res = requests.post("https://api.together.xyz/v1/chat/completions", headers=headers, json=payload)
        data = res.json()
        explanation = data['choices'][0]['message']['content']
        return jsonify({"explanation": explanation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/follow-up", methods=["POST"])
def follow_up_question():
    data = request.json
    code = data.get("code", "")
    output = data.get("output", "")
    question = data.get("question", "")

    if not (question):
        return jsonify({
            "answer": "❌ I can only respond to questions related to the code or its explanation."
        }), 400

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""The user wrote the following code:\n\n{code}\n\nThe output was:\n\n{output}\n\nThey now asked:\n\n{question}\n\nPlease respond appropriately."""

    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a programming assistant restricted to ONLY Python, C++, Java, and JavaScript. "
                    "If the user provides code or asks questions about any other language or framework such as HTML, CSS, React, Node.js, R, PHP, Ruby, etc., "
                    "you MUST respond with:\n\n"
                    "🚫 This website only supports Python, C++, Java, and JavaScript. Other languages or frameworks are not supported.\n\n"
                    "Do not attempt to answer anything unrelated to these supported languages."
                )
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        res = requests.post("https://api.together.xyz/v1/chat/completions", headers=headers, json=payload)
        answer = res.json()['choices'][0]['message']['content']
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500














#to run test case


JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"

JUDGE0_HEADERS = {
    "content-type": "application/json",
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "x-rapidapi-key": "ba9a44d556mshd1cf34f98416987p151e00jsn55ae02c2c0c5"  # 🔐 Free from RapidAPI
}

LANGUAGE_MAP = {
    "python": 71,
    "cpp": 54,
    "java": 62,
    "javascript": 63
}

@app.route("/api/run", methods=["POST"])
def run_code():
    data = request.json
    code = data.get("code")
    lang = data.get("language")
    stdin = data.get("input", "")

    if not code or not lang:
        return jsonify({"error": "Missing code or language"}), 400

    language_id = LANGUAGE_MAP.get(lang)
    if not language_id:
        return jsonify({"error": "Unsupported language"}), 400

    payload = {
        "source_code": code,
        "language_id": language_id,
        "stdin": stdin
    }

    try:
        res = requests.post(JUDGE0_URL, headers=JUDGE0_HEADERS, json=payload)
        data = res.json()
        output = data.get("stdout") or data.get("compile_output") or data.get("stderr") or "No output."
        return jsonify({"output": output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    

# Run Server
if __name__ == "__main__":
    app.run(debug=True)
