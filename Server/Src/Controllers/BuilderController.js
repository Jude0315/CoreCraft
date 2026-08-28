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

// Creates or reuses the requirement-building session for one project.
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

// Loads the saved requirement session for the logged-in user's project.
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

// Adds a chat message and extracts useful requirement data from user messages.
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
      // AI assistance is used here only to interpret the user's wording into features and requirements.
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
    
    // Detect app type and recommend features.
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

// Manually adds a feature chosen by the user.
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

// Removes a feature and remembers that the user rejected it.
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
// Returns predefined helper suggestions for known app-type hints.
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
 // Generates the assistant's next requirement question for the session.
/*-------------------------------------------------------- */
const GenerateBuilderAiResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const Session = await RequirementSession.findById(sessionId);

    if (!Session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // The reply is AI-assisted, but it is stored like any other session message.
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

    // Finalization locks the requirement session so generation can use it safely.
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



