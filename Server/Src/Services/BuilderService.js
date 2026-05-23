const FeatureMap = require("../../../Shared/Constants/FeatureMap");

const GetSuggestions = (appType) => {
  if (!appType) return [];

  return FeatureMap[appType] || [];
};

module.exports = {
  GetSuggestions,
};