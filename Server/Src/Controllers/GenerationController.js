const RequirementSession = require(
  "../Models/RequirementSession"
);

const {
  GenerateSpecification,
  CreateSchemaFiles,
  CreateBackendFiles,
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

    const specification =
      GenerateSpecification(session);

    session.generationSpecification =
      specification;

    session.specificationGeneratedAt =
      new Date();

    await session.save();

    return res.status(200).json({
      message:
        "Generation specification created successfully",
      specification:
        session.generationSpecification,
      session,
    });
  } catch (error) {
    console.error(
      "Generation specification error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create generation specification",
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

module.exports = {
  CreateGenerationSpecification,
  GenerateSchemas,
  GenerateBackend,
};