const {
  GenerateAiResponse,
  ExtractRequirementsFromMessage,
} = require("../Services/AiService");


const RequirementSession = require("../Models/RequirementSession");


const TestAiConnection = async (req, res) => {
  try {
    const fakeSession = {
      appType: "LMS",
      currentStep: "refinement",
      features: ["login", "courses", "dashboard"],
      removedFeatures: [],
      suggestions: [],
    };

    const AiReply = await GenerateAiResponse(fakeSession);

    res.json({
      success: true,
      message: AiReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const GenerateSessionAiResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const AiReply = await GenerateAiResponse(Session);

    Session.messages.push({
      role: "assistant",
      content: AiReply,
    });

    await Session.save();

    res.json({
      message: AiReply,
      session: Session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*----------------------------------------------------------------------------------*/
const ContinueAiConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "User response is required",
      });
    }

    // Save user's answer
    // Save user's answer
Session.messages.push({
  role: "user",
  content,
});

// Extract structured requirements from user's answer
const ExtractedData = await ExtractRequirementsFromMessage(content, Session);

if (ExtractedData.featuresToAdd && Array.isArray(ExtractedData.featuresToAdd)) {
  ExtractedData.featuresToAdd.forEach((feature) => {
    if (!Session.features.includes(feature)) {
      Session.features.push(feature);
    }
  });
}

if (
  ExtractedData.requirementsToAdd &&
  Array.isArray(ExtractedData.requirementsToAdd)
) {
  ExtractedData.requirementsToAdd.forEach((requirement) => {
    if (!Session.requirements.includes(requirement)) {
      Session.requirements.push(requirement);
    }
  });
}

await Session.save();

    // Generate next AI follow-up using updated session
    const AiReply = await GenerateAiResponse(Session);

    Session.messages.push({
      role: "assistant",
      content: AiReply,
    });

    await Session.save();

    res.json({
      userMessage: content,
      aiMessage: AiReply,
      session: Session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*----------------------------------------------------------------------------------*/

module.exports = {
  TestAiConnection,
  GenerateSessionAiResponse,
  ContinueAiConversation,
};