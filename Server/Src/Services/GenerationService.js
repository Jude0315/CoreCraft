
const path = require("path");
const fs = require("fs");

const {
  GenerateAuthFiles,
} = require("../Generators/AuthGenerator");

const {
  GenerateServerPackageJson,
  GenerateClientPackageJson,
  GenerateServerFile,
  GenerateServerAppFile,
  GenerateServerEnv,
  GenerateServerEnvExample,
  GenerateGitIgnore,
  GenerateReadme,
  GenerateClientEnv,
  GenerateClientEnvExample,
  GenerateMainJsx,
  GenerateAppLayout,
  GenerateAppJsx,
  GenerateIndexHtml,
} = require("../Generators/ProjectGenerator");


const {
  GenerateFrontendFiles,
} = require("../Generators/FrontendGenerator");

const {
  GenerateGlobalStyles,
} = require(
  "../Generators/UiGenerator"
);

const {
  GenerateBackendFiles,
} = require("../Generators/BackendGenerator");

const {
  GenerateLookupController,
  GenerateLookupRoutes,
} = require(
  "../Generators/LookupGenerator"
);

const {
  GenerateSchemaFiles,
} = require("../Generators/SchemaGenerator");

const {
  EnsureDirectoryExists,
  WriteGeneratedFile,
} = require("../Utils/FileWriter");

const {
  GenerateDynamicApplicationSpecification,
} = require("./AiService");

const {
  NormalizeSpecification,
} = require(
  "./SpecificationValidationService"
);

/*---------------------------------- */

const {
  GenerateApiService,
  GenerateAuthContext,
  GenerateProtectedRoute,
  GenerateThemeCss,
  GenerateLoginPage,
  GenerateRegisterPage,
} = require("../Generators/FrontendAuthGenerator");

const RemoveGeneratedDirectoryIfExists = (
  projectRoot,
  directoryPath
) => {
  const relativePath =
    path.relative(
      projectRoot,
      directoryPath
    );

  const isInsideProject =
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(
      relativePath
    );

  if (
    isInsideProject &&
    fs.existsSync(
      directoryPath
    )
  ) {
    fs.rmSync(
      directoryPath,
      {
        recursive: true,
        force: true,
      }
    );
  }
};


/*------------------------------------ */

const GenerateSpecification = async (session) => {
  if (!session) {
    throw new Error(
      "Requirement session is required"
    );
  }

  if (!session.finalized) {
    throw new Error(
      "Requirements must be finalized before generating the specification"
    );
  }

  // Ask the AI architecture engine to understand
  // the user's application dynamically.
  const rawSpecification =
    await GenerateDynamicApplicationSpecification(
      session
    );

  if (!rawSpecification) {
    throw new Error(
      "Unable to generate application specification"
    );
  }

  const {
    specification,
    warnings,
  } =
    NormalizeSpecification(
      rawSpecification
    );

  if (warnings.length > 0) {
    console.log(
      "\nCoreCraft specification normalization:"
    );

    warnings.forEach(
      (warning) => {
        console.log(
          `- ${warning}`
        );
      }
    );
  }

  // Basic validation to make sure the AI returned
  // the minimum structure needed by CoreCraft.
  if (
    !Array.isArray(
      specification.entities
    )
  ) {
    throw new Error(
      "Generated specification does not contain valid entities"
    );
  }

  if (
    !Array.isArray(
      specification.pages
    )
  ) {
    throw new Error(
      "Generated specification does not contain valid pages"
    );
  }

  if (
    !Array.isArray(
      specification.apiModules
    )
  ) {
    throw new Error(
      "Generated specification does not contain valid API modules"
    );
  }

  specification.stack = "MERN";

  // Preserve the original requirements so the
  // generated project remains traceable to the
  // user's requirement session.
  specification.features =
    Array.isArray(session.features)
      ? session.features
      : [];

  specification.requirements =
    Array.isArray(session.requirements)
      ? session.requirements
      : [];

  return specification;
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

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

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

/*---------------------------------------------------------------- */
const CreateBackendFiles = (
  projectId,
  specification
) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const backendFiles =
    GenerateBackendFiles(specification);

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

  const projectServerDirectory = path.join(
    process.cwd(),
    "..",
    "Generated-Projects",
    projectFolderName,
    "Server",
    "Src"
  );

  const controllersDirectory = path.join(
    projectServerDirectory,
    "Controllers"
  );

  const routesDirectory = path.join(
    projectServerDirectory,
    "Routes"
  );

  EnsureDirectoryExists(controllersDirectory);
  EnsureDirectoryExists(routesDirectory);

  const generatedControllers =
    backendFiles.controllerFiles.map(
      (controllerFile) => {
        const filePath =
          WriteGeneratedFile(
            controllersDirectory,
            controllerFile.filename,
            controllerFile.content
          );

        return {
          entity: controllerFile.entity,
          filename: controllerFile.filename,
          filePath,
        };
      }
    );

  const generatedRoutes =
    backendFiles.routeFiles.map(
      (routeFile) => {
        const filePath =
          WriteGeneratedFile(
            routesDirectory,
            routeFile.filename,
            routeFile.content
          );

        return {
          entity: routeFile.entity,
          filename: routeFile.filename,
          filePath,
        };
      }
    );

  const referenceFields =
    (specification.entities || [])
      .flatMap(
        (entity) =>
          (entity.fields || [])
            .filter(
              (field) =>
                field.type === "ObjectId" &&
                field.ref
            )
      );

  const generatedLookupFiles = [];

  if (
    referenceFields.length > 0
  ) {
    const lookupControllerCode =
      GenerateLookupController(
        specification
      );

    const lookupRoutesCode =
      GenerateLookupRoutes(
        specification
      );

    generatedLookupFiles.push(
      WriteGeneratedFile(
        controllersDirectory,
        "LookupController.js",
        lookupControllerCode
      )
    );

    generatedLookupFiles.push(
      WriteGeneratedFile(
        routesDirectory,
        "LookupRoutes.js",
        lookupRoutesCode
      )
    );
  }

  return {
    projectFolderName,
    controllersDirectory,
    routesDirectory,
    generatedControllers,
    generatedRoutes,
    generatedLookupFiles,
  };
};

/*------------------------------------------------------------- */
const CreateFrontendFiles = (
  projectId,
  specification
) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const frontendFiles =
    GenerateFrontendFiles(specification);

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

  const clientSrcDirectory =
    path.join(
      process.cwd(),
      "..",
      "Generated-Projects",
      projectFolderName,
      "Client",
      "src"
    );

  const pagesDirectory =
    path.join(
      clientSrcDirectory,
      "Pages"
    );

  const servicesDirectory =
    path.join(
      clientSrcDirectory,
      "Services"
    );

  const layoutsDirectory =
    path.join(
      clientSrcDirectory,
      "Layouts"
    );

  EnsureDirectoryExists(
    pagesDirectory
  );

  EnsureDirectoryExists(
    servicesDirectory
  );

  EnsureDirectoryExists(
    layoutsDirectory
  );

  /* -----------------------------------------
     Generate dynamic React pages
     ----------------------------------------- */

  const generatedPages =
    frontendFiles.pageFiles.map(
      (pageFile) => {
        const filePath =
          WriteGeneratedFile(
            pagesDirectory,
            pageFile.filename,
            pageFile.content
          );

        return {
          page:
            pageFile.page,

          componentName:
            pageFile.componentName,

          filename:
            pageFile.filename,

          filePath,
        };
      }
    );


  /* -----------------------------------------
     Generate dynamic API service

     This belongs to normal frontend
     generation, NOT authentication.
     ----------------------------------------- */

  const apiFilePath =
    WriteGeneratedFile(
      servicesDirectory,
      "Api.js",
      GenerateApiService(
        specification
      )
    );

  const globalStyles =
    GenerateGlobalStyles(
      specification
    );

  const globalStylesPath =
    WriteGeneratedFile(
      clientSrcDirectory,
      "index.css",
      globalStyles
    );

  const appLayoutCode =
    GenerateAppLayout(
      specification
    );

  const appLayoutPath =
    WriteGeneratedFile(
      layoutsDirectory,
      "AppLayout.jsx",
      appLayoutCode
    );


  return {
    projectFolderName,
    pagesDirectory,
    servicesDirectory,
    layoutsDirectory,
    generatedPages,
    apiFilePath,
    globalStylesPath,
    appLayoutPath,
  };
};

/*-------------------------------------------------------------- */

const CreateFullProject = (
  projectId,
  specification
) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

  const projectRoot = path.join(
    process.cwd(),
    "..",
    "Generated-Projects",
    projectFolderName,
  );

  const clientDirectory = path.join(
    projectRoot,
    "Client"
  );

  const clientSrcDirectory = path.join(
    clientDirectory,
    "src"
  );

  const serverDirectory = path.join(
    projectRoot,
    "Server"
  );

  const serverSrcDirectory = path.join(
    serverDirectory,
    "Src"
  );

  EnsureDirectoryExists(clientDirectory);
  EnsureDirectoryExists(clientSrcDirectory);
  EnsureDirectoryExists(serverDirectory);
  EnsureDirectoryExists(serverSrcDirectory);

  RemoveGeneratedDirectoryIfExists(
    projectRoot,
    path.join(
      clientSrcDirectory,
      "Pages"
    )
  );

  WriteGeneratedFile(
    projectRoot,
    "README.md",
    GenerateReadme(
      specification
    )
  );

  WriteGeneratedFile(
    projectRoot,
    ".gitignore",
    GenerateGitIgnore()
  );

  // Generate schemas
  const schemaResult = CreateSchemaFiles(
    projectId,
    specification
  );

  // Generate backend controllers + routes
  const backendResult = CreateBackendFiles(
    projectId,
    specification
  );

  const authenticationResult =
  CreateAuthenticationFiles(
    projectId,
    specification
  );

// Generate standard frontend pages first
const frontendResult = CreateFrontendFiles(
  projectId,
  specification
);

// Generate authentication frontend after
// so Login/Register pages replace generic placeholders
const frontendAuthResult =
  CreateFrontendAuthFiles(
    projectId,
    specification
  );

  // Server package.json
  WriteGeneratedFile(
    serverDirectory,
    "package.json",
    GenerateServerPackageJson(appName)
  );

  // Server .env
  WriteGeneratedFile(
    serverDirectory,
    ".env",
    GenerateServerEnv(
      specification
    )
  );

  // Server .env.example
  WriteGeneratedFile(
    serverDirectory,
    ".env.example",
    GenerateServerEnvExample(
      specification
    )
  );

  // Server.js
WriteGeneratedFile(
  serverSrcDirectory,
  "Server.js",
  GenerateServerFile()
);

// Server App.js
WriteGeneratedFile(
  serverSrcDirectory,
  "App.js",
  GenerateServerAppFile(
    specification
  )
);

// Client package.json
WriteGeneratedFile(
  clientDirectory,
  "package.json",
  GenerateClientPackageJson(appName)
);

// Client .env
WriteGeneratedFile(
  clientDirectory,
  ".env",
  GenerateClientEnv()
);

// Client .env.example
WriteGeneratedFile(
  clientDirectory,
  ".env.example",
  GenerateClientEnvExample()
);

// Client index.html
WriteGeneratedFile(
  clientDirectory,
  "index.html",
  GenerateIndexHtml(appName)
);

// Client main.jsx
WriteGeneratedFile(
  clientSrcDirectory,
  "main.jsx",
  GenerateMainJsx(
    specification
  )
);

// Client App.jsx
WriteGeneratedFile(
  clientSrcDirectory,
  "App.jsx",
  GenerateAppJsx(
    specification
  )
);

  return {
    projectFolderName,
    projectRoot,
    schemaResult,
    backendResult,
    frontendResult,
    authenticationResult,
    frontendAuthResult,
  };
};

/*--------------------------------------------------------------- */
const RequiresAuthentication = (
  specification = {}
) => {
  /*
    Authentication is required when the
    generated application contains roles,
    protected pages, or protected APIs.

    This avoids relying on old hardcoded
    feature names such as "login".
  */

  const roles =
    Array.isArray(
      specification.roles
    )
      ? specification.roles
      : [];

  const pages =
    Array.isArray(
      specification.pages
    )
      ? specification.pages
      : [];

  const apiModules =
    Array.isArray(
      specification.apiModules
    )
      ? specification.apiModules
      : [];


  const hasRoles =
    roles.length > 0;


  const hasProtectedPages =
    pages.some(
      (page) =>
        page?.protected === true
    );


  const hasProtectedApis =
    apiModules.some(
      (module) =>
        module?.protected === true
    );


  return (
    hasRoles ||
    hasProtectedPages ||
    hasProtectedApis
  );
};

/*--------------------------------------------------------------- */
const CreateAuthenticationFiles = (
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

  const hasAuthentication =
    RequiresAuthentication(
      specification
    );

  if (!hasAuthentication) {
    return {
      generated: false,
      reason:
        "Authentication is not required for this application",
    };
  }

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

  const serverSrcDirectory =
    path.join(
      process.cwd(),
      "..",
      "Generated-Projects",
      projectFolderName,
      "Server",
      "Src"
    );

  const controllersDirectory =
    path.join(
      serverSrcDirectory,
      "Controllers"
    );

  const modelsDirectory =
    path.join(
      serverSrcDirectory,
      "Models"
    );

  const middlewareDirectory =
    path.join(
      serverSrcDirectory,
      "Middleware"
    );

  const routesDirectory =
    path.join(
      serverSrcDirectory,
      "Routes"
    );

  EnsureDirectoryExists(
    controllersDirectory
  );

  EnsureDirectoryExists(
    modelsDirectory
  );

  EnsureDirectoryExists(
    middlewareDirectory
  );

  EnsureDirectoryExists(
    routesDirectory
  );

  const files =
    GenerateAuthFiles(
      specification
    );

  const generatedFiles = [];

  generatedFiles.push(
    WriteGeneratedFile(
      modelsDirectory,
      files.model.filename,
      files.model.content
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      controllersDirectory,
      files.controller.filename,
      files.controller.content
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      middlewareDirectory,
      files.authMiddleware.filename,
      files.authMiddleware.content
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      middlewareDirectory,
      files.roleMiddleware.filename,
      files.roleMiddleware.content
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      routesDirectory,
      files.routes.filename,
      files.routes.content
    )
  );

  return {
    generated: true,
    generatedFiles,
  };
};


const CreateFrontendAuthFiles = (
  projectId,
  specification
) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!specification) {
    throw new Error(
      "Generation specification is required"
    );
  }

  const hasAuthentication =
    RequiresAuthentication(
      specification
    );

  if (!hasAuthentication) {
    return {
      generated: false,
      reason:
        "Authentication is not required for this application",
    };
  }

  const appName =
    specification.applicationName ||
    specification.appType ||
    "Application";

  const projectFolderName =
    `${appName}-${projectId}`;

  const clientSrcDirectory = path.join(
    process.cwd(),
    "..",
    "Generated-Projects",
    projectFolderName,
    "Client",
    "src"
  );

  const contextDirectory = path.join(
    clientSrcDirectory,
    "Context"
  );

  const routesDirectory = path.join(
    clientSrcDirectory,
    "Routes"
  );

  const servicesDirectory = path.join(
    clientSrcDirectory,
    "Services"
  );

  const stylesDirectory = path.join(
    clientSrcDirectory,
    "Styles"
  );

  const pagesDirectory = path.join(
    clientSrcDirectory,
    "Pages"
  );

  EnsureDirectoryExists(
    contextDirectory
  );

  EnsureDirectoryExists(
    routesDirectory
  );

  EnsureDirectoryExists(
    servicesDirectory
  );

  EnsureDirectoryExists(
    stylesDirectory
  );

  EnsureDirectoryExists(
    pagesDirectory
  );

  const generatedFiles = [];

  generatedFiles.push(
    WriteGeneratedFile(
      contextDirectory,
      "AuthContext.jsx",
      GenerateAuthContext()
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      routesDirectory,
      "ProtectedRoute.jsx",
      GenerateProtectedRoute()
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      stylesDirectory,
      "theme.css",
      GenerateThemeCss(appName)
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      pagesDirectory,
      "Login.jsx",
      GenerateLoginPage(
        appName,
        specification.roles || [],
        specification.pages || [],
        specification
      )
    )
  );

  generatedFiles.push(
    WriteGeneratedFile(
      pagesDirectory,
      "Register.jsx",
      GenerateRegisterPage(
        appName,
        specification.roles || [],
        specification
      )
    )
  );

  return {
    generated: true,
    generatedFiles,
  };
};

/*---------------------------------------------------------------- */

module.exports = {
  GenerateSpecification,
  CreateSchemaFiles,
  CreateBackendFiles,
  CreateFrontendFiles,
  CreateFullProject,
  CreateAuthenticationFiles,
  CreateFrontendAuthFiles,
  RequiresAuthentication,
};
