const mongoose = require("mongoose");


/* =========================================================
   Dynamic Generation Specification Schemas

   These schemas store the architecture produced by the
   CoreCraft AI specification engine.

   They are intentionally generic so CoreCraft can describe
   ANY MERN application domain.
   ========================================================= */


// Describes one field inside a generated entity.
//
// Example:
// {
//   name: "machine",
//   type: "ObjectId",
//   ref: "Machine",
//   required: true
// }
const ReferenceFilterSchema =
  new mongoose.Schema(
    {
      field: {
        type: String,
        default: "",
      },

      operator: {
        type: String,
        enum: [
          "equals",
          "notEquals",
          "in",
          "notIn",
        ],
        default: "equals",
      },

      value: {
        type:
          mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    {
      _id: false,
    }
  );


const FieldSpecificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        required: true,
        enum: [
          "String",
          "Number",
          "Boolean",
          "Date",
          "ObjectId",
          "Mixed",
        ],
      },

      required: {
        type: Boolean,
        default: false,
      },

      unique: {
        type: Boolean,
        default: false,
      },

      defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      ref: {
        type: String,
        default: "",
      },

      referenceFilter: {
        type: ReferenceFilterSchema,
        default: null,
      },

      displayFields: {
        type: [String],
        default: [],
      },

      enumValues: {
        type: [String],
        default: [],
      },

      description: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );


// Describes a dynamically discovered domain entity.
//
// Examples:
//
// Machine
// Appointment
// Vehicle
// MaintenanceJob
// LeaveRequest
const EntitySpecificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        default: "",
      },

      fields: {
        type: [
          FieldSpecificationSchema,
        ],
        default: [],
      },
    },
    {
      _id: false,
    }
  );


// Describes a generated React page.
const PageSpecificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      route: {
        type: String,
        default: "/",
      },

      type: {
        type: String,
        enum: [
          "list",
          "detail",
          "form",
          "dashboard",
          "auth",
          "crud",
        ],
        default: "list",
      },

      entity: {
        type: String,
        default: "",
      },

      protected: {
        type: Boolean,
        default: false,
      },

      roles: {
        type: [String],
        default: [],
      },

      actions: {
        type: [String],
        default: [],
      },

      description: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );


// Describes one backend API module.
const ApiModuleSpecificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      entity: {
        type: String,
        default: "",
      },

      operations: {
        type: [String],
        default: [],
      },

      protected: {
        type: Boolean,
        default: false,
      },

      roles: {
        type: [String],
        default: [],
      },

      description: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );


// Explains important generated files to the developer.
const ImportantFileSchema =
  new mongoose.Schema(
    {
      path: {
        type: String,
        default: "",
      },

      purpose: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );


// Complete AI-generated application architecture.
const GenerationSpecificationSchema =
  new mongoose.Schema(
    {
      applicationName: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      appType: {
        type: String,
        default: "",
      },

      stack: {
        type: String,
        default: "MERN",
      },

      roles: {
        type: [String],
        default: [],
      },

      entities: {
        type: [
          EntitySpecificationSchema,
        ],
        default: [],
      },

      pages: {
        type: [
          PageSpecificationSchema,
        ],
        default: [],
      },

      apiModules: {
        type: [
          ApiModuleSpecificationSchema,
        ],
        default: [],
      },

      features: {
        type: [String],
        default: [],
      },

      requirements: {
        type: [String],
        default: [],
      },

      documentation: {
        overview: {
          type: String,
          default: "",
        },

        architectureExplanation: {
          type: String,
          default: "",
        },

        importantFiles: {
          type: [
            ImportantFileSchema,
          ],
          default: [],
        },

        nextSteps: {
          type: [String],
          default: [],
        },
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   Requirement Session
   ========================================================= */

const RequirementSessionSchema =
  new mongoose.Schema(
    {
      project: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      // Legacy app type detection may leave this empty.
      // The dynamic specification engine can infer
      // the real application type later.
      appType: {
        type: String,
        default: "",
      },

      features: {
        type: [String],
        default: [],
      },

      removedFeatures: {
        type: [String],
        default: [],
      },

      requirements: {
        type: [String],
        default: [],
      },

      messages: [
        {
          role: {
            type: String,
          },

          content: {
            type: String,
          },
        },
      ],

      suggestions: {
        type: [String],
        default: [],
      },

      currentStep: {
        type: String,
        default: "initial",
      },

      requirementSummary: {
        type: String,
        default: "",
      },

      // Stores the AI-designed MERN architecture.
      generationSpecification: {
        type:
          GenerationSpecificationSchema,
        default: () => ({}),
      },

      specificationGeneratedAt: {
        type: Date,
      },

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


module.exports =
  mongoose.model(
    "RequirementSession",
    RequirementSessionSchema
  );
