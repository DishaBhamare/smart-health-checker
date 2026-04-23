import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  name: String,
  weight: Number
});

const diseaseSchema = new mongoose.Schema({
 disease_name: {
  type: String,
  required: true,
  unique: true,
  trim: true
},
  description: String,
   symptoms: [symptomSchema],
  precautions: {
  type: [String],
  default: []
}
 
});

const Disease = mongoose.model("Disease", diseaseSchema);

export default Disease;
