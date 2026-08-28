const mongoose = require("mongoose");

// A collection of tasks aimed at achieving a specific objective.
// This model was generated dynamically by CoreCraft.
// AI assistance helped identify this entity from the saved project requirements.
// Add domain-specific validation or business rules here if needed.

// This Mongoose schema defines the structure of each Project document stored in MongoDB.
// Each field below comes from the CoreCraft generation specification.
const ProjectSchema =
  new mongoose.Schema(
    {
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  // This field stores a reference to the User collection.
  // Mongoose can populate this reference so the frontend receives readable related data.
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },

  createdAt: {
    type: Date,
    required: true,
    default: "Date.now"
  },

  dueDate: {
    type: Date,
    required: true
  }
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Project",
    ProjectSchema
  );
