require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// ------------------- HOSPITALS API ------------------------
app.get("/api/hospitals", async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching hospitals" });
  }
});


// ------------------- CHATBOT API ------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a medical assistant. Answer ONLY health-related questions in 3–4 lines. Provide safe, accurate suggestions like a doctor, but never prescribe strong medicines. For emergencies, tell them to visit a doctor."
          },
          { role: "user", content: message }
        ],
        max_tokens: 150
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json({ reply: reply.data.choices[0].message.content });
  } catch (err) {
    console.error("Chat Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Health assistant unavailable" });
  }
});


// ------------------- START SERVER ------------------------
app.listen(5000, () => console.log("Server running at http://localhost:5000"));
