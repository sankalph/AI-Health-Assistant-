require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 🔥 OFFLINE DISEASE → MEDICINE DATABASE
const treatmentData = {
  "common cold": "For common cold, take Paracetamol 500mg, Cetirizine 10mg, and steam inhalation twice a day.",
  "cold": "For common cold, take Paracetamol 500mg, Cetirizine 10mg, and steam inhalation twice a day.",
  "covid-19": "For COVID-19, take Paracetamol 650mg, Zincovit once daily, Vitamin C 500mg twice daily. Stay hydrated.",
  "covid": "For COVID-19, take Paracetamol 650mg, Zincovit once daily, Vitamin C 500mg twice daily. Stay hydrated.",
  "dengue": "For dengue, take ONLY Paracetamol 650mg and ORS solution. Avoid ibuprofen & aspirin.",
  "diphtheria": "Diphtheria requires immediate medical attention. Antibiotics like Erythromycin or Penicillin are used. Visit a hospital urgently.",
  "flu": "For flu, take Oseltamivir (Tamiflu) 75mg, Paracetamol 500mg, and warm fluids regularly.",
  "influenza": "For influenza, take Oseltamivir 75mg, Paracetamol, and plenty of rest.",
  "hepatitis": "For Hepatitis, avoid fatty foods, stay hydrated, and take prescribed antiviral drugs. Immediate doctor evaluation needed.",
  "measles": "For Measles, take Vitamin A supplements and Paracetamol. Hydrate well and take rest.",
  "mumps": "For Mumps, Paracetamol 500mg and Ibuprofen can help reduce pain. Apply warm compress.",
  "polio": "Polio requires urgent hospital care. Supportive treatment includes pain relievers and physiotherapy.",
  "rabies": "Rabies requires immediate vaccination (Rabipur). Go to a hospital URGENTLY.",
  "anemia": "For Anemia, take Iron tablets (Ferrous Sulphate), Folic Acid, and Vitamin B12 supplements.",
  "asthma": "For Asthma, use Salbutamol inhaler, Budesonide inhaler, and Montelukast once daily.",
  "diabetes": "For Diabetes, take Metformin 500mg twice daily and maintain a low-sugar diet.",
  "hypertension": "For high BP, take Amlodipine 5mg or Telmisartan 40mg. Reduce salt intake.",
  "high blood pressure": "Take Amlodipine 5mg, Telmisartan 40mg, or Atenolol 25mg daily. Monitor BP regularly.",
  "kidney stones": "For kidney stones, take Tamsulosin 0.4mg, Diclofenac for pain, and drink 3–4L of water daily.",
  "bladder cancer": "Bladder cancer treatment requires hospital care: surgery, chemo, or immunotherapy.",
  "breast cancer": "Breast cancer treatment includes hormone therapy and chemotherapy. Needs specialist consultation."
};

// 🔥 MAIN CHAT ENDPOINT
app.post("/api/chat", (req, res) => {
  const userMessage = req.body.message?.toLowerCase();

  if (!userMessage) {
    return res.json({ reply: "Please ask a valid health question." });
  }

  // Default reply
  let reply = "Sorry, I don't have information on that condition. Try another one.";

  // Match disease in message
  for (let key in treatmentData) {
    if (userMessage.includes(key)) {
      reply = treatmentData[key];
      break;
    }
  }

  res.json({ reply });
});

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("AI Health Assistant Backend Running (Offline Mode)");
});

// Start Server
app.listen(3000, () => console.log("Server running on port 5000"));
