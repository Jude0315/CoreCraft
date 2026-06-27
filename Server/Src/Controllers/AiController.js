const { GenerateAiResponse } = require("../Services/AiService");
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

module.exports = {
  TestAiConnection,
  GenerateSessionAiResponse,
};