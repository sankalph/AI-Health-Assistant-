import React, { useState } from "react";
import "./Chatbot.css";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hello! I'm your AI Health Assistant. Ask me any health-related question!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 📌 SEND MESSAGE TO BACKEND
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 🔥 Correct Backend URL
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMsg.text,
      });

      const reply =
        res.data.reply ||
        res.data.answer ||
        "⚠️ I couldn't understand that. Can you rephrase?";

      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "⚠️ Unable to reach the AI Health Server. Please check if the backend is running on port 5000.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <h3>🧠 AI Health Assistant</h3>
        <p>Your personal smart health guide</p>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>
            <div className="msg-bubble">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="msg-bubble typing">Typing...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Ask a health question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ color: "black", background: "white" }}
        />
        <button onClick={handleSend} className="hover-btn">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
