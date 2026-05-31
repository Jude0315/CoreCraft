const RequirementSession = require("../Models/RequirementSession");

const { GetSuggestions, DetectAppType } = require("../Services/BuilderService");

// Create new session for a project
const CreateSession = async (req, res) => {
  try {
    const { projectId } = req.body;

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
    
    /*Extra function added to detect app type */

    //  Detect app type
// Detect app type and auto-add suggested features
if (!Session.appType && role === "user") {
  const DetectedType = DetectAppType(content);

  if (DetectedType) {
    Session.appType = DetectedType;

    // Get suggested features for detected app type
    const Suggestions = GetSuggestions(DetectedType);

    // Only populate if features are still empty
    if (Session.features.length === 0) {
      Session.features = Suggestions;
    }
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




module.exports = {
  CreateSession,
  GetSession,
  AddMessage,
  AddFeature,
  RemoveFeature,
  GetFeatureSuggestions,
};



