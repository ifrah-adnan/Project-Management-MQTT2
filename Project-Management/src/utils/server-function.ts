import * as fs from "fs";

export function isFileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export function isFile(filePath: string) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

export function isImage(filePath: string) {
  const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
  const extension = filePath.split(".").pop();
  return allowedExtensions.includes(extension as string);
}
