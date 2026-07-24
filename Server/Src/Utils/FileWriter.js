const fs = require("fs");
const path = require("path");

const EnsureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, {
      recursive: true,
    });
  }
};

const WriteGeneratedFile = (
  directoryPath,
  filename,
  content
) => {
  EnsureDirectoryExists(directoryPath);

  const filePath = path.join(
    directoryPath,
    filename
  );

  fs.writeFileSync(
    filePath,
    content,
    "utf8"
  );

  return filePath;
};

module.exports = {
  EnsureDirectoryExists,
  WriteGeneratedFile,
};