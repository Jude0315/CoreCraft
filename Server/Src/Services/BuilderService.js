const FeatureMap = require("../../../Shared/Constants/FeatureMap");

const GetSuggestions = (appType) => {
  if (!appType) return [];

  return FeatureMap[appType] || [];
};

/*App type detection  */

const DetectAppType = (message) => {
  const text = message.toLowerCase();

  if (text.includes("lms")) return "LMS";
  if (text.includes("blog")) return "Blog";
  if (text.includes("ecommerce") || text.includes("store"))
    return "Ecommerce";
  if (text.includes("portfolio")) return "Portfolio";

  return "";
};


/*--------------------------------- */



module.exports = {
  GetSuggestions,
   DetectAppType,
};