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

    requirements: [
      {
        type: String,
      },
    ],

    messages: [
      {
        role: String,
        content: String,
      },
    ],

    suggestions: [
      {
        type: String,
      },
    ],

    currentStep: {
      type: String,
      default: "initial",
    },

    requirementSummary: {
      type: String,
      default: "",
    },

    /*-------------------------------------------- */

    generationSpecification: {
  appType: {
    type: String,
    default: "",
  },

  stack: {
    type: String,
    default: "MERN",
  },

  entities: [
    {
      type: String,
    },
  ],

  pages: [
    {
      type: String,
    },
  ],

  apiModules: [
    {
      type: String,
    },
  ],

  features: [
    {
      type: String,
    },
  ],

  requirements: [
    {
      type: String,
    },
  ],
},

specificationGeneratedAt: {
  type: Date,
},

    /*----------------------------------------------------------------------------*/

    finalizedAt: {
      type: Date,
    },

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