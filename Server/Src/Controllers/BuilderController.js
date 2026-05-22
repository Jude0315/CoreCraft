const RequirementSession = require("../Models/RequirementSession");

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

module.exports = {
  CreateSession,
  GetSession,
  AddMessage,
  AddFeature,
  RemoveFeature,
};