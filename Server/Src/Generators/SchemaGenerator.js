const NormalizeEntityName = (name = "") => {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^./, (char) =>
      char.toUpperCase()
    );
};


const GenerateSectionComment = (
  lines = []
) => {
  return lines
    .map(
      (line) =>
        `// ${line}`
    )
    .join("\n");
};


const GenerateFieldDefinition = (field) => {
  if (!field || !field.name) {
    throw new Error(
      "Invalid field specification"
    );
  }

  const supportedTypes = {
    String: "String",
    Number: "Number",
    Boolean: "Boolean",
    Date: "Date",
    Mixed:
      "mongoose.Schema.Types.Mixed",
    ObjectId:
      "mongoose.Schema.Types.ObjectId",
  };

  const mongooseType =
    supportedTypes[field.type] ||
    "String";

  const properties = [
    `type: ${mongooseType}`,
  ];

  if (field.required) {
    properties.push(
      "required: true"
    );
  }

  if (field.unique) {
    properties.push(
      "unique: true"
    );
  }

  if (
    field.type === "ObjectId" &&
    field.ref
  ) {
    properties.push(
      `ref: "${field.ref}"`
    );
  }

  if (
    Array.isArray(field.enumValues) &&
    field.enumValues.length > 0
  ) {
    properties.push(
      `enum: ${JSON.stringify(
        field.enumValues
      )}`
    );
  }

  if (
    field.defaultValue !== null &&
    field.defaultValue !== undefined
  ) {
    properties.push(
      `default: ${JSON.stringify(
        field.defaultValue
      )}`
    );
  }

  const relationshipComment =
    field.type === "ObjectId" &&
    field.ref
      ? `  // This field stores a reference to the ${field.ref} collection.
  // Mongoose can populate this reference so the frontend receives readable related data.
`
      : "";

  return `${relationshipComment}  ${field.name}: {
    ${properties.join(",\n    ")}
  }`;
};


const GenerateSchemaFile = (
  entity
) => {
  if (!entity || !entity.name) {
    throw new Error(
      "Entity name is required"
    );
  }

  const entityName =
    NormalizeEntityName(
      entity.name
    );

  const fields =
    Array.isArray(entity.fields)
      ? entity.fields
      : [];

  const fieldDefinitions =
    fields
      .map(
        GenerateFieldDefinition
      )
      .join(",\n\n");

  const entityDescription =
    entity.description ||
    `Stores ${entityName} records for the generated application.`;

  return `const mongoose = require("mongoose");

// ${entityDescription}
// This model was generated dynamically by CoreCraft.
// Add domain-specific validation or business rules here if needed.

${GenerateSectionComment([
  `This Mongoose schema defines the structure of each ${entityName} document stored in MongoDB.`,
  "Each field below comes from the CoreCraft generation specification.",
])}
const ${entityName}Schema =
  new mongoose.Schema(
    {
${fieldDefinitions}
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "${entityName}",
    ${entityName}Schema
  );
`;
};


const GenerateSchemaFiles = (
  specification
) => {
  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  if (
    !Array.isArray(
      specification.entities
    )
  ) {
    throw new Error(
      "Specification entities must be an array"
    );
  }

  return specification.entities.map(
    (entity) => {
      const entityName =
        NormalizeEntityName(
          entity.name
        );

      return {
        entity: entityName,
        filename:
          `${entityName}.js`,
        content:
          GenerateSchemaFile(
            entity
          ),
      };
    }
  );
};


module.exports = {
  GenerateSchemaFiles,
  GenerateSchemaFile,
  GenerateFieldDefinition,
  GenerateSectionComment,
  NormalizeEntityName,
};
