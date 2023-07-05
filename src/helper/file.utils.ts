import fs from 'fs-extra';

export const readFile = relativePath => {
  const fileContents = fs.readFileSync(relativePath, {
    encoding: 'utf-8',
  });
  return fileContents;
};

export const writeFile = (relativePath, fileContents) => {
  fs.ensureFileSync(relativePath);
  fs.writeFileSync(relativePath, fileContents, {
    encoding: 'utf-8',
  });
};

export const createDirectory = (relativePath, emptyIfExists = true) => {
    if (!fs.existsSync(relativePath)) {
        fs.mkdirSync(relativePath, { recursive: true });
    } else if (emptyIfExists) {
        fs.emptyDirSync(relativePath);
    }
};
