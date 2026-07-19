const RequirementSession = require(
  "../Models/RequirementSession"
);

const {
  GenerateSpecification,
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

module.exports = {
  CreateGenerationSpecification,
};