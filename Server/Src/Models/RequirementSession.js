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


const RoleActionSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        required: true,
      },

      actions: {
        type: [String],
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

      roleActions: {
        type: [RoleActionSchema],
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

      roleActions: {
        type: [RoleActionSchema],
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


const ColorSpecificationSchema =
  new mongoose.Schema(
    {
      primary: {
        type: String,
        default: "#2563eb",
      },

      primaryText: {
        type: String,
        default: "#ffffff",
      },

      secondary: {
        type: String,
        default: "#64748b",
      },

      background: {
        type: String,
        default: "#f8fafc",
      },

      surface: {
        type: String,
        default: "#ffffff",
      },

      surfaceText: {
        type: String,
        default: "#0f172a",
      },

      text: {
        type: String,
        default: "#0f172a",
      },

      mutedText: {
        type: String,
        default: "#64748b",
      },

      border: {
        type: String,
        default: "#e2e8f0",
      },

      danger: {
        type: String,
        default: "#dc2626",
      },

      success: {
        type: String,
        default: "#16a34a",
      },
    },
    {
      _id: false,
    }
  );


const SpacingSpecificationSchema =
  new mongoose.Schema(
    {
      xs: {
        type: String,
        default: "6px",
      },

      sm: {
        type: String,
        default: "10px",
      },

      md: {
        type: String,
        default: "16px",
      },

      lg: {
        type: String,
        default: "24px",
      },

      xl: {
        type: String,
        default: "32px",
      },
    },
    {
      _id: false,
    }
  );


const RadiusSpecificationSchema =
  new mongoose.Schema(
    {
      input: {
        type: String,
        default: "10px",
      },

      card: {
        type: String,
        default: "12px",
      },

      button: {
        type: String,
        default: "10px",
      },
    },
    {
      _id: false,
    }
  );


const LayoutSpecificationSchema =
  new mongoose.Schema(
    {
      navigation: {
        type: String,
        enum: [
          "sidebar",
          "topbar",
          "hybrid",
        ],
        default: "sidebar",
      },

      sidebarWidth: {
        type: String,
        default: "250px",
      },

      headerHeight: {
        type: String,
        default: "68px",
      },

      pageMaxWidth: {
        type: String,
        default: "1400px",
      },
    },
    {
      _id: false,
    }
  );


const AuthBackgroundSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "solid",
          "gradient",
          "radial",
          "mesh",
          "pattern",
        ],
        default: "gradient",
      },

      primary: {
        type: String,
        default: "#121212",
      },

      secondary: {
        type: String,
        default: "#2e1065",
      },

      accent: {
        type: String,
        default: "#6a0dad",
      },

      direction: {
        type: String,
        default: "135deg",
      },
    },
    {
      _id: false,
    }
  );


const AuthPanelSchema =
  new mongoose.Schema(
    {
      style: {
        type: String,
        enum: [
          "solid",
          "glass",
          "bordered",
          "minimal",
        ],
        default: "solid",
      },

      width: {
        type: String,
        default: "420px",
      },

      opacity: {
        type: Number,
        default: 1,
      },

      padding: {
        type: String,
        default: "32px",
      },
    },
    {
      _id: false,
    }
  );


const AuthBrandingSchema =
  new mongoose.Schema(
    {
      show: {
        type: Boolean,
        default: true,
      },

      position: {
        type: String,
        enum: [
          "left",
          "right",
          "top",
          "none",
        ],
        default: "left",
      },

      showDescription: {
        type: Boolean,
        default: true,
      },

      alignment: {
        type: String,
        enum: [
          "left",
          "center",
          "right",
        ],
        default: "left",
      },
    },
    {
      _id: false,
    }
  );


const AuthDecorationSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "none",
          "glow",
          "grid",
          "orbs",
          "lines",
        ],
        default: "none",
      },

      intensity: {
        type: String,
        enum: [
          "subtle",
          "medium",
          "strong",
        ],
        default: "subtle",
      },
    },
    {
      _id: false,
    }
  );


const AuthSpecificationSchema =
  new mongoose.Schema(
    {
      formPosition: {
        type: String,
        enum: [
          "left",
          "right",
          "center",
        ],
        default: "right",
      },

      contentAlignment: {
        type: String,
        enum: [
          "start",
          "center",
          "end",
        ],
        default: "center",
      },

      background: {
        type: AuthBackgroundSchema,
        default: () => ({}),
      },

      panel: {
        type: AuthPanelSchema,
        default: () => ({}),
      },

      branding: {
        type: AuthBrandingSchema,
        default: () => ({}),
      },

      decoration: {
        type: AuthDecorationSchema,
        default: () => ({}),
      },
    },
    {
      _id: false,
    }
  );


const UiSpecificationSchema =
  new mongoose.Schema(
    {
      theme: {
        type: String,
        enum: [
          "modern",
          "minimal",
          "corporate",
          "bold",
          "elegant",
        ],
        default: "modern",
      },

      style: {
        type: String,
        enum: [
          "professional",
          "clean",
          "friendly",
          "technical",
          "premium",
        ],
        default: "professional",
      },

      colors: {
        type: ColorSpecificationSchema,
        default: () => ({}),
      },

      spacing: {
        type: SpacingSpecificationSchema,
        default: () => ({}),
      },

      radius: {
        type: RadiusSpecificationSchema,
        default: () => ({}),
      },

      layout: {
        type: LayoutSpecificationSchema,
        default: () => ({}),
      },

      auth: {
        type: AuthSpecificationSchema,
        default: () => ({}),
      },

      cardShadow: {
        type: String,
        default:
          "0 10px 30px rgba(15, 23, 42, 0.08)",
      },

      fontStyle: {
        type: String,
        enum: [
          "modern",
          "classic",
          "technical",
          "elegant",
        ],
        default: "modern",
      },

      headingWeight: {
        type: Number,
        default: 700,
      },

      bodyWeight: {
        type: Number,
        default: 400,
      },

      cardStyle: {
        type: String,
        enum: [
          "flat",
          "bordered",
          "elevated",
        ],
        default: "elevated",
      },

      buttonStyle: {
        type: String,
        enum: [
          "square",
          "soft",
          "rounded",
          "pill",
        ],
        default: "rounded",
      },

      tableStyle: {
        type: String,
        enum: [
          "minimal",
          "clean",
          "striped",
          "bordered",
        ],
        default: "clean",
      },

      formStyle: {
        type: String,
        enum: [
          "stacked",
          "compact",
          "two-column",
        ],
        default: "stacked",
      },

      visualDensity: {
        type: String,
        enum: [
          "compact",
          "comfortable",
          "spacious",
        ],
        default: "comfortable",
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

      ui: {
        type: UiSpecificationSchema,
        default: () => ({}),
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
