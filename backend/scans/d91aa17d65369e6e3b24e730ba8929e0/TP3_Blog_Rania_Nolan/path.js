import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(`${__filename}`);

const __parentDir = join(__dirname, '..');
export { __dirname, __filename, __parentDir };

