
const path = require("path");

const {
  GenerateSchemaFiles,
} = require("../Generators/SchemaGenerator");

const {
  EnsureDirectoryExists,
  WriteGeneratedFile,
} = require("../Utils/FileWriter");

const GenerateSpecification = (session) => {
    
  if (!session) {
    throw new Error("Requirement session is required");
  }

  if (!session.finalized) {
    throw new Error(
      "Requirements must be finalized before generating the specification"
    );
  }

  const features = Array.isArray(session.features)
    ? session.features
    : [];

  const requirements = Array.isArray(session.requirements)
    ? session.requirements
    : [];

  const entities = DetectEntities(
    session.appType,
    features,
    requirements
  );

  const pages = DetectPages(
    session.appType,
    features,
    requirements
  );

  const apiModules = DetectApiModules(
    session.appType,
    features,
    entities
  );

  return {
    appType: session.appType,
    stack: "MERN",
    entities,
    pages,
    apiModules,
    features,
    requirements,
  };
};

const DetectEntities = (
  appType,
  features = [],
  requirements = []
) => {
  const detectedEntities = new Set();

  const combinedText = [
    appType,
    ...features,
    ...requirements,
  ]
    .join(" ")
    .toLowerCase();

  detectedEntities.add("User");

  const entityRules = [
    {
      keywords: ["course", "courses"],
      entity: "Course",
    },
    {
      keywords: ["lesson", "lessons", "content"],
      entity: "Lesson",
    },
    {
      keywords: ["quiz", "quizzes"],
      entity: "Quiz",
    },
    {
      keywords: ["assignment", "assignments"],
      entity: "Assignment",
    },
    {
      keywords: ["progress", "tracking"],
      entity: "Progress",
    },
    {
      keywords: ["certificate", "certificates"],
      entity: "Certificate",
    },
    {
      keywords: ["payment", "payments"],
      entity: "Payment",
    },
    {
      keywords: ["student", "students"],
      entity: "Student",
    },
    {
      keywords: ["instructor", "instructors", "teacher"],
      entity: "Instructor",
    },
    {
      keywords: ["product", "products"],
      entity: "Product",
    },
    {
      keywords: ["order", "orders"],
      entity: "Order",
    },
    {
      keywords: ["cart", "shopping cart"],
      entity: "Cart",
    },
    {
      keywords: ["category", "categories"],
      entity: "Category",
    },
    {
      keywords: ["inventory", "stock"],
      entity: "Inventory",
    },
  ];

  entityRules.forEach(({ keywords, entity }) => {
    const hasMatch = keywords.some((keyword) =>
      combinedText.includes(keyword)
    );

    if (hasMatch) {
      detectedEntities.add(entity);
    }
  });

  return Array.from(detectedEntities);
};

const DetectPages = (
  appType,
  features = [],
  requirements = []
) => {
  const detectedPages = new Set();

  const combinedText = [
    appType,
    ...features,
    ...requirements,
  ]
    .join(" ")
    .toLowerCase();

  detectedPages.add("Home Page");

  const pageRules = [
    {
      keywords: ["login", "authentication"],
      page: "Login Page",
    },
    {
      keywords: ["register", "registration", "signup"],
      page: "Registration Page",
    },
    {
      keywords: ["dashboard"],
      page: "Dashboard",
    },
    {
      keywords: ["course", "courses"],
      page: "Courses Page",
    },
    {
      keywords: ["course"],
      page: "Course Details Page",
    },
    {
      keywords: ["quiz", "quizzes"],
      page: "Quizzes Page",
    },
    {
      keywords: ["assignment", "assignments"],
      page: "Assignments Page",
    },
    {
      keywords: ["progress", "tracking"],
      page: "Progress Tracking Page",
    },
    {
      keywords: ["instructor portal", "instructorportal"],
      page: "Instructor Portal",
    },
    {
      keywords: ["student management"],
      page: "Student Management Page",
    },
    {
      keywords: ["product", "products"],
      page: "Products Page",
    },
    {
      keywords: ["cart"],
      page: "Shopping Cart Page",
    },
    {
      keywords: ["checkout"],
      page: "Checkout Page",
    },
    {
      keywords: ["order", "orders"],
      page: "Orders Page",
    },
    {
      keywords: ["admin"],
      page: "Admin Dashboard",
    },
  ];

  pageRules.forEach(({ keywords, page }) => {
    const hasMatch = keywords.some((keyword) =>
      combinedText.includes(keyword)
    );

    if (hasMatch) {
      detectedPages.add(page);
    }
  });

  return Array.from(detectedPages);
};

const DetectApiModules = (
  appType,
  features = [],
  entities = []
) => {
  const detectedModules = new Set();

  const combinedText = [
    appType,
    ...features,
    ...entities,
  ]
    .join(" ")
    .toLowerCase();

  detectedModules.add("Authentication API");

  const apiRules = [
    {
      keywords: ["course"],
      module: "Course API",
    },
    {
      keywords: ["lesson"],
      module: "Lesson API",
    },
    {
      keywords: ["quiz"],
      module: "Quiz API",
    },
    {
      keywords: ["assignment"],
      module: "Assignment API",
    },
    {
      keywords: ["progress"],
      module: "Progress API",
    },
    {
      keywords: ["student"],
      module: "Student Management API",
    },
    {
      keywords: ["instructor"],
      module: "Instructor API",
    },
    {
      keywords: ["certificate"],
      module: "Certificate API",
    },
    {
      keywords: ["payment"],
      module: "Payment API",
    },
    {
      keywords: ["product"],
      module: "Product API",
    },
    {
      keywords: ["order"],
      module: "Order API",
    },
    {
      keywords: ["cart"],
      module: "Cart API",
    },
    {
      keywords: ["inventory"],
      module: "Inventory API",
    },
  ];

  apiRules.forEach(({ keywords, module }) => {
    const hasMatch = keywords.some((keyword) =>
      combinedText.includes(keyword)
    );

    if (hasMatch) {
      detectedModules.add(module);
    }
  });

  return Array.from(detectedModules);
};

const CreateSchemaFiles = (
  projectId,
  specification
) => {
  if (!projectId) {
    throw new Error(
      "Project ID is required"
    );
  }

  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const schemaFiles =
    GenerateSchemaFiles(specification);

  if (schemaFiles.length === 0) {
    throw new Error(
      "No entities were found for schema generation"
    );
  }

  const projectFolderName =
    `${specification.appType || "Application"}-${projectId}`;

  const modelsDirectory = path.join(
    process.cwd(),
    "..",
    "Generated-Projects",
    projectFolderName,
    "Server",
    "Src",
    "Models"
  );

  EnsureDirectoryExists(modelsDirectory);

  const generatedFiles = schemaFiles.map(
    (schemaFile) => {
      const filePath = WriteGeneratedFile(
        modelsDirectory,
        schemaFile.filename,
        schemaFile.content
      );

      return {
        entity: schemaFile.entity,
        filename: schemaFile.filename,
        filePath,
      };
    }
  );

  return {
    projectFolderName,
    modelsDirectory,
    generatedFiles,
  };
};

module.exports = {
  GenerateSpecification,
  DetectEntities,
  DetectPages,
  DetectApiModules,
  CreateSchemaFiles,
};