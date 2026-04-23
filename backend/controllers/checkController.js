import mongoose from "mongoose";
import Check from "../models/Check.js";
import Disease from "../models/Disease.js";

/* ======================================================
   DATABASE-BASED WEIGHTED DIAGNOSIS (SMART ENGINE)
====================================================== */
async function databaseDiagnosis(symptoms) {
  const normalizedSymptoms = symptoms.map(s =>
    s.trim().toLowerCase()
  );

  const diseases = await Disease.find();

  let results = [];

  for (let disease of diseases) {
    let score = 0;

    for (let symptom of disease.symptoms) {
      const dbSymptom = symptom.name.trim().toLowerCase();

      if (normalizedSymptoms.includes(dbSymptom)) {
        score += symptom.weight;
      }
    }

    if (score > 0) {
      const totalPossibleScore = disease.symptoms.reduce(
        (sum, s) => sum + s.weight,
        0
      );

      const confidenceNumber = (score / totalPossibleScore) * 100;

      results.push({
        diagnosis: disease.disease_name,
        medicines: ["Consult Doctor"],
        precautions: disease.precautions || [],
        score,
        confidence: confidenceNumber
      });
    }
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.score - a.score);

  const topResults = results.slice(0, 3);

  topResults.forEach(result => {
    let severity = "Low";
    let riskLevel = "Low";

    if (result.confidence >= 70) {
      severity = "High";
      riskLevel = "High";
    } else if (result.confidence >= 40) {
      severity = "Moderate";
      riskLevel = "Medium";
    }

    result.severity = severity;
    result.riskLevel = riskLevel;
    result.confidence = result.confidence.toFixed(2) + "%";
  });

  return topResults;
}

/* ======================================================
   RULE-BASED DIAGNOSIS (FALLBACK SYSTEM)
====================================================== */
function ruleBasedDiagnosis(symptoms) {
  const normalizedSymptoms = symptoms.map(s => s.trim().toLowerCase());
  const has = s => normalizedSymptoms.includes(s.toLowerCase());
  const results = [];

  if (has("fever") && has("cough") && has("cold")) {
    results.push({
      diagnosis: "Common Cold / Flu",
      medicines: ["Paracetamol", "Cough Syrup"],
      precautions: ["Rest well", "Stay hydrated", "Avoid cold exposure"]
    });
  }

  const singleSymptomRules = [
    { symptom: "fever", diagnosis: "Possible Fever", medicines: ["Paracetamol"], precautions: ["Rest", "Drink fluids"] },
    { symptom: "cough", diagnosis: "Cough", medicines: ["Cough Syrup"], precautions: ["Drink warm fluids", "Avoid cold exposure"] },
    { symptom: "cold", diagnosis: "Common Cold", medicines: ["Paracetamol"], precautions: ["Stay warm", "Rest"] },
    { symptom: "sore throat", diagnosis: "Sore Throat", medicines: ["Lozenges"], precautions: ["Gargle warm salt water", "Avoid spicy food"] }
  ];

  normalizedSymptoms.forEach(symp => {
    const matched = singleSymptomRules.find(r => r.symptom === symp);
    if (matched && !results.some(r => r.diagnosis === matched.diagnosis)) {
      results.push({
        diagnosis: matched.diagnosis,
        medicines: matched.medicines,
        precautions: matched.precautions
      });
    }
  });

  if (results.length === 0) {
    results.push({
      diagnosis: "General Checkup Required",
      medicines: ["Paracetamol"],
      precautions: ["Rest", "Drink fluids", "Consult doctor"]
    });
  }

  return results;
}

/* ======================================================
   CHECK SYMPTOMS API
====================================================== */
export const checkSymptoms = async (req, res) => {
  try {
    const { userName, userEmail, symptoms } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Symptoms must be a non-empty array"
      });
    }

    let dbResult = await databaseDiagnosis(symptoms);
    let results;

    if (dbResult && dbResult.length > 0) {
      const topConfidence = parseFloat(dbResult[0].confidence);

      if (topConfidence >= 40) {
        results = dbResult;
      } else {
        results = ruleBasedDiagnosis(symptoms);
      }
    } else {
      results = ruleBasedDiagnosis(symptoms);
    }

    /* ✅ FIX: Ensure all results have required fields */
    results.forEach(r => {
      if (!r.confidence) {
        r.confidence = "50%";
        r.severity = "Low";
        r.riskLevel = "Low";
      }
    });

    const emergency = results.some(r => r.severity === "High");

    const newCheck = new Check({
      userId: req.user._id,
      userName,
      userEmail,
      symptoms,
      results,
      emergency
    });

    await newCheck.save(); // ✅ fixed duplicate save

    res.status(200).json({
      success: true,
      message: "Diagnosis completed successfully",
      userName,
      userEmail,
      count: results.length,
      emergency,
      results
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};
/* ======================================================
   GET USER FULL HISTORY
====================================================== */
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const checks = await Check.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: checks.length,
      data: checks
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch history"
    });
  }
};
/* ======================================================
   GET LAST CHECK
====================================================== */
export const getUserLastCheck = async (req, res) => {
  try {
    const userId = req.params.userId;

    const lastCheck = await Check.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!lastCheck) {
      return res.json({
        success: false,
        message: "No previous record"
      });
    }

    res.json({
      success: true,
      data: lastCheck
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch data"
    });
  }
};
