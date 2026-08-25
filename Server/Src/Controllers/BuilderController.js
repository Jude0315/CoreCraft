const RequirementSession = require("../Models/RequirementSession");
const Project = require("../Models/Project");
const {
  GenerateAiResponse,
  ExtractRequirementsFromMessage,
} = require("../Services/AiService");

const {
  GetSuggestions,
  DetectAppType,
  GetFollowUpSuggestions,
  DetermineNextStep,
} = require("../Services/BuilderService");

// Create new session for a project
const CreateSession = async (req, res) => {
  try {
    const { projectId } = req.body;

    const ProjectFound = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!ProjectFound) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const ExistingSession = await RequirementSession.findOne({
      project: projectId,
    });

    if (ExistingSession) {
      return res.json(ExistingSession);
    }

    const Session = await RequirementSession.create({
      project: projectId,
    });

    res.status(201).json(Session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session by project
const GetSession = async (req, res) => {
  try {
    const { projectId } = req.params;

    const ProjectFound = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!ProjectFound) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const Session = await RequirementSession.findOne({
      project: projectId,
    });

    res.json(Session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add message to session
const AddMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({ message: "Session not found" });
    }

    Session.messages.push({ role, content });

    /*
      Extract useful structured requirements
      from every user message.
    */

    if (role === "user") {
      const extracted =
        await ExtractRequirementsFromMessage(
          content,
          Session
        );

      const featuresToAdd =
        Array.isArray(
          extracted?.featuresToAdd
        )
          ? extracted.featuresToAdd
          : [];

      const requirementsToAdd =
        Array.isArray(
          extracted?.requirementsToAdd
        )
          ? extracted.requirementsToAdd
          : [];

      for (const feature of featuresToAdd) {
        if (
          feature &&
          !Session.features.includes(
            feature
          ) &&
          !Session.removedFeatures.includes(
            feature
          )
        ) {
          Session.features.push(
            feature
          );
        }
      }

      for (
        const requirement
        of requirementsToAdd
      ) {
        if (
          requirement &&
          !Session.requirements.includes(
            requirement
          )
        ) {
          Session.requirements.push(
            requirement
          );
        }
      }
    }
    
    /*Extra function added to detect app type */

    //  Detect app type
// Detect app type and recommend features
if (!Session.appType && role === "user") {
  const DetectedType = DetectAppType(content);

  if (DetectedType) {
    Session.appType = DetectedType;

    const Suggestions = GetSuggestions(DetectedType);
    const FollowUps = GetFollowUpSuggestions(DetectedType);

    /*
      Suggestions are recommendations only.
      The user chooses what gets added
      to the final feature list.
    */
    Session.suggestions = [
      ...new Set([
        ...Suggestions,
        ...FollowUps,
      ]),
    ];

    Session.currentStep = "feature_selection";
  }
} 

/*-------------------------------- */

    await Session.save();

    res.json(Session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add feature
const AddFeature = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { feature } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!Session.features.includes(feature)) {
      Session.features.push(feature);
    }

    await Session.save();

    res.json(Session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove feature
const RemoveFeature = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { feature } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({ message: "Session not found" });
    }

    Session.features = Session.features.filter(
      (f) => f !== feature
    );

    Session.removedFeatures.push(feature);

    await Session.save();

    res.json(Session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AcceptSuggestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { suggestion } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    Session.suggestions = Session.suggestions.filter(
      (s) => s !== suggestion
    );

    if (!Session.features.includes(suggestion)) {
      Session.features.push(suggestion);
    }

    Session.currentStep = DetermineNextStep(Session);

    await Session.save();

    res.json(Session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const RejectSuggestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { suggestion } = req.body;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    Session.suggestions = Session.suggestions.filter(
      (s) => s !== suggestion
    );

    if (!Session.removedFeatures.includes(suggestion)) {
      Session.removedFeatures.push(suggestion);
    }

    Session.currentStep = DetermineNextStep(Session);

    await Session.save();

    res.json(Session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*-----------------------------------------------------*/
//Get suggestion



const GetFeatureSuggestions = async (req, res) => {
  try {
    const { appType } = req.params;

    const Suggestions = GetSuggestions(appType);

    res.json(Suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*-------------------------------------------------------- */
 // Add message function
/*-------------------------------------------------------- */
const GenerateBuilderAiResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({ message: "Session not found" });
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
    res.status(500).json({ message: error.message });
  }
};
/*-------------------------------------------------------- */

const FinalizeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const Session =
      await RequirementSession.findById(
        sessionId
      );

    if (!Session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (Session.messages.length === 0) {
      return res.status(400).json({
        message:
          "Add at least one requirement before finalizing",
      });
    }

    Session.finalized = true;
    Session.finalizedAt = new Date();
    Session.currentStep = "finalized";

    await Session.save();

    await Project.findByIdAndUpdate(
      Session.project,
      {
        status:
          "requirements-finalized",
      }
    );

    res.json(Session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  CreateSession,
  GetSession,
  AddMessage,
  AddFeature,
  RemoveFeature,
  GetFeatureSuggestions,
  AcceptSuggestion,
  RejectSuggestion,
  GenerateBuilderAiResponse,
  FinalizeSession,
};



