const fs =
  require("fs");

const path =
  require("path");

const ShouldExcludeFromExport = (
  relativePath = ""
) => {
  const normalized =
    relativePath.replace(
      /\\/g,
      "/"
    );

  const parts =
    normalized
      .split("/")
      .filter(Boolean);

  const excludedDirectories = [
    "node_modules",
    "dist",
    "build",
    ".git",
  ];

  if (
    parts.some((part) =>
      excludedDirectories.includes(
        part
      )
    )
  ) {
    return true;
  }

  const fileName =
    parts[parts.length - 1] ||
    "";

  if (
    fileName === ".DS_Store"
  ) {
    return true;
  }

  if (
    fileName.endsWith(".log")
  ) {
    return true;
  }

  return false;
};


const AddDirectoryToArchive = (
  archive,
  sourceDirectory,
  archiveDirectory = ""
) => {
  const entries =
    fs.readdirSync(
      sourceDirectory,
      {
        withFileTypes: true,
      }
    );

  for (
    const entry
    of entries
  ) {
    const sourcePath =
      path.join(
        sourceDirectory,
        entry.name
      );

    const relativePath =
      path.join(
        archiveDirectory,
        entry.name
      );

    if (
      ShouldExcludeFromExport(
        relativePath
      )
    ) {
      continue;
    }

    if (
      entry.isDirectory()
    ) {
      AddDirectoryToArchive(
        archive,
        sourcePath,
        relativePath
      );

      continue;
    }

    archive.file(
      sourcePath,
      {
        name:
          relativePath.replace(
            /\\/g,
            "/"
          ),
      }
    );
  }
};


const CreateProjectZip = async (
  projectPath,
  zipPath
) => {
  const {
    ZipArchive,
  } =
    await import(
      "archiver"
    );

  return new Promise(
    (resolve, reject) => {
      const output =
        fs.createWriteStream(
          zipPath
        );

      const archive =
        new ZipArchive({
          zlib: {
            level: 9,
          },
        });

      output.on(
        "close",
        () => {
          resolve({
            zipPath,
            size:
              archive.pointer(),
          });
        }
      );

      archive.on(
        "error",
        reject
      );

      archive.pipe(
        output
      );

      AddDirectoryToArchive(
        archive,
        projectPath
      );

      archive.finalize();
    }
  );
};


module.exports = {
  CreateProjectZip,
  ShouldExcludeFromExport,
};
