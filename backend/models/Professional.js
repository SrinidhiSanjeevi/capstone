const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 4.8
    },
    experience: {
      type: Number,
      required: true // Years of experience
    },
    image: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Available", "Busy"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Professional", professionalSchema);
