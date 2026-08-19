const RequirementSession = require(
  "../Models/RequirementSession"
);

const {
  GenerateSpecification,
  CreateSchemaFiles,
  CreateBackendFiles,
  CreateFrontendFiles,
   CreateFullProject,
} = require("../Services/GenerationService");

const CreateGenerationSpecification = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session =
      await RequirementSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Requirement session not found",
      });
    }

    if (!session.finalized) {
      return res.status(400).json({
        message:
          "Requirements must be finalized before generating the specification",
      });
    }

    // Dynamic AI-generated architecture
    const specification =
      await GenerateSpecification(
        session
      );

    session.generationSpecification =
      specification;

    session.specificationGeneratedAt =
      new Date();

    await session.save();

    return res.status(200).json({
      message:
        "Dynamic generation specification created successfully",
      specification,
      session,
    });
  } catch (error) {
    console.error(
      "Specification generation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to generate application specification",
    });
  }
};


/*-------------------------------------------------------- */
const GenerateSchemas = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session =
      await RequirementSession.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Requirement session not found",
      });
    }

    if (!session.finalized) {
      return res.status(400).json({
        message:
          "Requirements must be finalized before schema generation",
      });
    }

    if (
      !session.generationSpecification ||
      !session.generationSpecification.entities ||
      session.generationSpecification.entities
        .length === 0
    ) {
      return res.status(400).json({
        message:
          "Generation specification must be created before schema generation",
      });
    }

    const result = CreateSchemaFiles(
      session.project.toString(),
      session.generationSpecification
    );

    return res.status(200).json({
      message:
        "Schema files generated successfully",
      projectFolder:
        result.projectFolderName,
      modelsDirectory:
        result.modelsDirectory,
      generatedFiles:
        result.generatedFiles,
    });
  } catch (error) {
    console.error(
      "Schema generation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate schema files",
    });
  }
};

/*----------------------------------------------------------- */
const GenerateBackend = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session =
      await RequirementSession.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Requirement session not found",
      });
    }

    if (!session.finalized) {
      return res.status(400).json({
        message:
          "Requirements must be finalized before backend generation",
      });
    }

    if (
      !session.generationSpecification ||
      !session.generationSpecification.entities ||
      session.generationSpecification.entities
        .length === 0
    ) {
      return res.status(400).json({
        message:
          "Generation specification must be created before backend generation",
      });
    }

    const result = CreateBackendFiles(
      session.project.toString(),
      session.generationSpecification
    );

    return res.status(200).json({
      message:
        "Backend files generated successfully",
      projectFolder:
        result.projectFolderName,
      controllers:
        result.generatedControllers,
      routes:
        result.generatedRoutes,
    });
  } catch (error) {
    console.error(
      "Backend generation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate backend files",
    });
  }
};

/*---------------------------------------------------------- */
const GenerateFrontend = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await RequirementSession.findById(
      sessionId
    );

    if (!session) {
      return res.status(404).json({
        message: "Requirement session not found",
      });
    }

    if (!session.finalized) {
      return res.status(400).json({
        message:
          "Requirements must be finalized before frontend generation",
      });
    }

    if (
      !session.generationSpecification ||
      !session.generationSpecification.pages ||
      session.generationSpecification.pages.length === 0
    ) {
      return res.status(400).json({
        message:
          "Generation specification must be created before frontend generation",
      });
    }

    const result = CreateFrontendFiles(
      session.project.toString(),
      session.generationSpecification
    );

    return res.status(200).json({
      message:
        "Frontend files generated successfully",
      projectFolder:
        result.projectFolderName,
      pages:
        result.generatedPages,
    });
  } catch (error) {
    console.error(
      "Frontend generation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate frontend files",
    });
  }
};

/*---------------------------------------------------------- */

const GenerateFullProject = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const session =
      await RequirementSession.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Requirement session not found",
      });
    }

    if (!session.finalized) {
      return res.status(400).json({
        message:
          "Requirements must be finalized before project generation",
      });
    }

    if (
      !session.generationSpecification ||
      !session.generationSpecification.entities ||
      session.generationSpecification.entities
        .length === 0
    ) {
      return res.status(400).json({
        message:
          "Generation specification must be created before project generation",
      });
    }

    const result = CreateFullProject(
      session.project.toString(),
      session.generationSpecification
    );

    return res.status(200).json({
      message:
        "Full project generated successfully",
      projectFolder:
        result.projectFolderName,
      projectRoot:
        result.projectRoot,
      schemas:
        result.schemaResult.generatedFiles,
      controllers:
        result.backendResult.generatedControllers,
      routes:
        result.backendResult.generatedRoutes,
      pages:
        result.frontendResult.generatedPages,
      authentication:
        result.authenticationResult,
      frontendAuthentication:
        result.frontendAuthResult,
    });
  } catch (error) {
    console.error(
      "Full project generation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to generate full project",
    });
  }
};
/**----------------------------------------------------------------- */

module.exports = {
  CreateGenerationSpecification,
  GenerateSchemas,
  GenerateBackend,
  GenerateFrontend,
  GenerateFullProject,
};
