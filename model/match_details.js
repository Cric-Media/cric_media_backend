const mongoose = require("mongoose");

const teamDetailsSchema = new mongoose.Schema({
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

const TeamDetails = mongoose.model("TeamDetails", teamDetailsSchema);

module.exports = TeamDetails;
