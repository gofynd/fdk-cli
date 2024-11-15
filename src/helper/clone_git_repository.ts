import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import extract from 'extract-zip';
import Debug from './../lib/Debug';
import { moveDirContent } from './utils';
import { TEMP_DIR_NAME } from './constants';
import ini from 'ini';

interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export async function cloneGitRepository(
  repositoryUrl: string,
  targetDirectory: string,
  branch: string = 'main',
): Promise<void> {
  const { owner, repo } = parseGitHubUrl(repositoryUrl);
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  
  await downloadAndExtractZip(zipUrl, targetDirectory, repo, branch);

  // Handle any submodules within the repository
  await handleSubmodules(targetDirectory, branch);

  // Cleanup Git-related files and directories
  await cleanupGitFiles(targetDirectory);

  Debug(`Repository cloned and prepared at ${targetDirectory}`);
}

// Common function to download, extract, and clean up a ZIP file
async function downloadAndExtractZip(
  zipUrl: string,
  targetDirectory: string,
  repo: string,
  branch: string,
): Promise<void> {
  const tempDirectory = path.join(targetDirectory, TEMP_DIR_NAME);

  try {
    // Ensure the target and temp directories exist
    await fs.ensureDir(targetDirectory);
    await fs.ensureDir(tempDirectory);

    // Download the ZIP file
    const zipFilePath = path.join(tempDirectory, 'download.zip');
    await downloadZipFile(zipUrl, zipFilePath);

    // Extract ZIP file contents
    await extractZipFile(zipFilePath, tempDirectory);

    // Determine extracted directory path based on GitHub's ZIP structure
    const extractedDirName = `${repo}-${branch}`;
    const extractedDirPath = path.join(tempDirectory, extractedDirName);

    // Move extracted contents to the target directory
    await moveDirContent(extractedDirPath, targetDirectory);

    Debug(`ZIP file downloaded, extracted, and cleaned up to ${targetDirectory}`);
  } catch (error) {
    Debug(`Error in downloadAndExtractZip: ${error.message}`);
    throw new Error(`Failed to download and extract ZIP file: ${error.message}`);
  } finally {
    // Clean up the temporary directory
    await fs.remove(tempDirectory);
  }
}

// Helper function to download a ZIP file as an arraybuffer
async function downloadZipFile(zipUrl: string, destinationPath: string): Promise<void> {
  Debug(`Downloading ZIP from ${zipUrl}`);
  try {
    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(destinationPath, response.data);
    Debug(`ZIP file downloaded to ${destinationPath}`);
  } catch (error) {
    Debug(`Error downloading ZIP file from ${zipUrl}: ${error.message}`);
    throw new Error(`Failed to download ZIP file: ${error.message}`);
  }
}

// Helper function to extract ZIP file
async function extractZipFile(zipFilePath: string, extractTo: string): Promise<void> {
  const absoluteExtractTo = path.isAbsolute(extractTo) ? extractTo : path.resolve(extractTo);
  Debug(`Extracting ZIP file ${zipFilePath} to ${absoluteExtractTo}`);
  try {
    await extract(zipFilePath, { dir: absoluteExtractTo });
    Debug(`ZIP file extracted to ${absoluteExtractTo}`);
  } catch (error) {
    Debug(`Error extracting ZIP file: ${error.message}`);
    throw new Error(`Failed to extract ZIP file: ${error.message}`);
  }
}

// Helper function to clean up Git-related files and directories
async function cleanupGitFiles(targetDirectory: string): Promise<void> {
  const filesToRemove = ['.git', '.github', '.gitmodules'];
  for (const file of filesToRemove) {
    const filePath = path.join(targetDirectory, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      Debug(`Removed ${filePath}`);
    }
  }
}

// Function to handle submodules by parsing .gitmodules and processing each
async function handleSubmodules(targetDirectory: string, branch: string): Promise<void> {
  const gitmodulesPath = path.join(targetDirectory, '.gitmodules');
  if (await fs.pathExists(gitmodulesPath)) {
    const gitmodulesContent = await fs.readFile(gitmodulesPath, 'utf-8');
    const submodules = parseGitModules(gitmodulesContent);

    for (const submodule of submodules) {
      const submoduleDirectory = path.join(targetDirectory, submodule.path);
      const { owner, repo } = parseGitHubUrl(submodule.url);
      const submoduleZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;

      // Download, extract, and clean up each submodule
      await downloadAndExtractZip(submoduleZipUrl, submoduleDirectory, repo, branch);

      // Recursively handle any submodules within this submodule
      await handleSubmodules(submoduleDirectory, branch);

      // Cleanup Git-related files and directories
      await cleanupGitFiles(submoduleDirectory);
    }
  } else {
    Debug(`No submodules found in ${targetDirectory}`);
  }
}

// Helper function to parse the GitHub URL to get owner and repo
function parseGitHubUrl(url: string): GitHubRepoInfo {
  const regex = /github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/;
  const matches = url.match(regex);
  if (!matches) throw new Error('Invalid GitHub repository URL.');
  return { owner: matches[1], repo: matches[2] };
}

// Helper function to parse .gitmodules content and retrieve path and URL
function parseGitModules(content: string): Array<{ path: string; url: string }> {
  const config = ini.parse(content);
  const submodules: Array<{ path: string; url: string }> = [];
  for (const key in config) {
    if (key.startsWith('submodule')) {
      const submoduleConfig = config[key];
      const path = submoduleConfig.path?.replace(/\t/g, '').trim();
      const url = submoduleConfig.url?.replace(/\t/g, '').trim();
      if (path && url) submodules.push({ path, url });
    }
  }
  return submodules;
}
