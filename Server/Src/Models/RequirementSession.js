const mongoose = require("mongoose");

const RequirementSessionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    appType: {
      type: String,
      default: "",
    },

    features: [
      {
        type: String,
      },
    ],

    removedFeatures: [
      {
        type: String,
      },
    ],

    messages: [
      {
        role: String, // "user" or "assistant"
        content: String,
      },
    ],

    finalized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RequirementSession",
  RequirementSessionSchema
);