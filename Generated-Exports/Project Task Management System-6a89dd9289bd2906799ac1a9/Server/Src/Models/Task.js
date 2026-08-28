const mongoose = require("mongoose");

// Specific assignments within projects that need to be completed.
// This model was generated dynamically by CoreCraft.
// AI assistance helped identify this entity from the saved project requirements.
// Add domain-specific validation or business rules here if needed.

// This Mongoose schema defines the structure of each Task document stored in MongoDB.
// Each field below comes from the CoreCraft generation specification.
const TaskSchema =
  new mongoose.Schema(
    {
  title: {
    type: String,
    required: true
  },

  priority: {
    type: String,
    required: true,
    enum: ["low","medium","high"]
  },

  status: {
    type: String,
    required: true,
    enum: ["pending","in progress","completed"],
    default: "pending"
  },

  // This field stores a reference to the Project collection.
  // Mongoose can populate this reference so the frontend receives readable related data.
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Project"
  },

  // This field stores a reference to the User collection.
  // Mongoose can populate this reference so the frontend receives readable related data.
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Task",
    TaskSchema
  );
