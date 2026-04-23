import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  diagnosis: String,
  confidence: String,
  severity: String,
  riskLevel: String,
  medicines: [String],
  precautions: [String]
}, { _id: false });

const checkSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  userName: String,
  userEmail: String,
  symptoms: [String],

  results: [resultSchema],   // 🔥 store full results
  emergency: Boolean,        // 🔥 store emergency flag

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Check", checkSchema);