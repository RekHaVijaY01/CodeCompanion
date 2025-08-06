import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function MainPage() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [activeTab, setActiveTab] = useState(""); // output | followup
  const [loading, setLoading] = useState(false);

  const handleRunCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/run", {
        code,
        input,
        language,
      });
      setOutput(res.data.output);
      setActiveTab("output");
    } catch (err) {
      setOutput("❌ " + (err.response?.data?.error || "Something went wrong."));
      setActiveTab("output");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Code Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
        />
      </div>

      {/* Right Panel */}
      <div
        style={{
          width: "40%",
          backgroundColor: "#1e1e1e",
          color: "white",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        {/* Language Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {/* Input */}
        <textarea
          placeholder="Test input (if any)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            height: "80px",
            marginBottom: "1rem",
            padding: "0.5rem",
          }}
        />

        {/* Run Button */}
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleRunCode}>▶️ Run Code</button>
        </div>

        {/* Follow-Up Tab Button */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button onClick={() => setActiveTab("followup")}>Follow-up</button>
        </div>

        {/* Content Display */}
        {loading && <div>⏳ Loading...</div>}

        {!loading && activeTab === "output" && (
          <div style={{ whiteSpace: "pre-wrap" }}>
            <strong>📤 Code Output:</strong>
            <div>{output}</div>
          </div>
        )}

        {!loading && activeTab === "followup" && (
          <div>
            <strong>Have a follow-up question?</strong>
            <textarea
              placeholder="Ask here..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              style={{
                width: "100%",
                height: "60px",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <button
              disabled={!followUpQuestion.trim()}
              onClick={async () => {
                setLoading(true);
                try {
               
const res = await axios.post("http://localhost:5000/api/follow-up", {
  code,         // send code from editor
  output,       // send output (optional)
  question: followUpQuestion
});

                  setFollowUpAnswer(res.data.answer);
                } catch (err) {
                  setFollowUpAnswer("❌ " + (err.response?.data?.error || "Something went wrong."));
                }
                setLoading(false);
              }}
            >
              Ask
            </button>

            {followUpAnswer && (
              <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
                <strong>💬 Answer:</strong>
                <div>{followUpAnswer}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
