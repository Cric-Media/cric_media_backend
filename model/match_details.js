const mongoose = require("mongoose");

const matchDetailsSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  matchType: String,
  ballType: String,
  pitchType: String,
  numberOfOvers: Number,
  oversPerBowler: Number,
  cityOrTown: String,
  ground: String,
  matchDateTime: Date,
  whoWinTheToss: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  tossDetails: String,
  matchStatus: { type: String, enum: ["upcoming", "ongoing", "completed"] },
});

const MatchDetails = mongoose.model("MatchDetails", matchDetailsSchema);

module.exports = MatchDetails;
