import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

export async function cloneRepo(githubUrl, token = null) {
  if (!githubUrl.match(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/)) {
    throw new Error('URL GitHub invalide');
  }

  const id = crypto.randomUUID();
  const destPath = path.join('/tmp', `scan_${id}`);

  const authUrl = token
    ? githubUrl.replace('https://', `https://${token}@`)
    : githubUrl;

  await execFileAsync('git', ['clone', '--depth', '1', authUrl, destPath], {
    timeout: 30000,
  });

  return destPath;
}
