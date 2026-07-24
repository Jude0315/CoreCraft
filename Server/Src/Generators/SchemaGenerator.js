const GenerateSchemaFiles = (specification) => {
  if (!specification) {
    throw new Error("Generation specification is required");
  }

  const entities = Array.isArray(specification.entities)
    ? specification.entities
    : [];

  return entities.map((entity) => ({
    entity,
    filename: `${entity}.js`,
    content: GenerateEntitySchema(entity),
  }));
};

const GenerateEntitySchema = (entity) => {
  const fields = GetEntityFields(entity);

  const formattedFields = Object.entries(fields)
    .map(([fieldName, fieldDefinition]) => {
      return `  ${fieldName}: ${FormatFieldDefinition(fieldDefinition)},`;
    })
    .join("\n");

  return `const mongoose = require("mongoose");

const ${entity}Schema = new mongoose.Schema(
{
${formattedFields}
},
{
  timestamps: true,
}
);

module.exports = mongoose.model(
  "${entity}",
  ${entity}Schema
);
`;
};

const GetEntityFields = (entity) => {
  const commonSchemas = {
    User: {
      name: {
        type: "String",
        required: true,
        trim: true,
      },

      email: {
        type: "String",
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: "String",
        required: true,
      },

      role: {
        type: "String",
        enum: ["student", "instructor", "admin"],
        default: "student",
      },
    },

    Student: {
      user: {
        type: "ObjectId",
        ref: "User",
        required: true,
      },

      enrolledCourses: {
        type: "ObjectIdArray",
        ref: "Course",
      },
    },

    Instructor: {
      user: {
        type: "ObjectId",
        ref: "User",
        required: true,
      },

      courses: {
        type: "ObjectIdArray",
        ref: "Course",
      },

      bio: {
        type: "String",
        default: "",
      },
    },

    Course: {
      title: {
        type: "String",
        required: true,
        trim: true,
      },

      description: {
        type: "String",
        default: "",
      },

      instructor: {
        type: "ObjectId",
        ref: "User",
        required: true,
      },

      lessons: {
        type: "ObjectIdArray",
        ref: "Lesson",
      },

      students: {
        type: "ObjectIdArray",
        ref: "User",
      },

      published: {
        type: "Boolean",
        default: false,
      },
    },

    Lesson: {
      course: {
        type: "ObjectId",
        ref: "Course",
        required: true,
      },

      title: {
        type: "String",
        required: true,
      },

      content: {
        type: "String",
        default: "",
      },

      videoUrl: {
        type: "String",
        default: "",
      },

      order: {
        type: "Number",
        default: 0,
      },
    },

    Quiz: {
      course: {
        type: "ObjectId",
        ref: "Course",
        required: true,
      },

      title: {
        type: "String",
        required: true,
      },

      questions: {
        type: "MixedArray",
      },

      passingScore: {
        type: "Number",
        default: 50,
      },
    },

    Assignment: {
      course: {
        type: "ObjectId",
        ref: "Course",
        required: true,
      },

      title: {
        type: "String",
        required: true,
      },

      description: {
        type: "String",
        default: "",
      },

      dueDate: {
        type: "Date",
      },

      maximumMarks: {
        type: "Number",
        default: 100,
      },
    },

    Progress: {
      student: {
        type: "ObjectId",
        ref: "User",
        required: true,
      },

      course: {
        type: "ObjectId",
        ref: "Course",
        required: true,
      },

      completedLessons: {
        type: "ObjectIdArray",
        ref: "Lesson",
      },

      progressPercentage: {
        type: "Number",
        default: 0,
      },

      lastAccessedAt: {
        type: "Date",
      },
    },
  };

  return (
    commonSchemas[entity] || {
      name: {
        type: "String",
        required: true,
        trim: true,
      },

      description: {
        type: "String",
        default: "",
      },

      active: {
        type: "Boolean",
        default: true,
      },
    }
  );
};

const FormatFieldDefinition = (definition) => {
  if (definition.type === "ObjectId") {
    return FormatObject({
      ...definition,
      type: "mongoose.Schema.Types.ObjectId",
    });
  }

  if (definition.type === "ObjectIdArray") {
    const parts = [
      "type: [mongoose.Schema.Types.ObjectId]",
    ];

    if (definition.ref) {
      parts.push(`ref: "${definition.ref}"`);
    }

    return `{ ${parts.join(", ")} }`;
  }

  if (definition.type === "MixedArray") {
    return "{ type: [mongoose.Schema.Types.Mixed], default: [] }";
  }

  return FormatObject(definition);
};

const FormatObject = (object) => {
  const properties = Object.entries(object).map(
    ([key, value]) => {
      if (
        key === "type" &&
        typeof value === "string" &&
        value.startsWith("mongoose.")
      ) {
        return `${key}: ${value}`;
      }

      if (key === "type" && typeof value === "string") {
        return `${key}: ${value}`;
      }

      if (Array.isArray(value)) {
        return `${key}: ${JSON.stringify(value)}`;
      }

      if (typeof value === "string") {
        return `${key}: "${value}"`;
      }

      return `${key}: ${value}`;
    }
  );

  return `{ ${properties.join(", ")} }`;
};

module.exports = {
  GenerateSchemaFiles,
  GenerateEntitySchema,
  GetEntityFields,
};