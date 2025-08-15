import fs from 'node:fs';
import path from 'node:path';

const envFilePath = path.resolve('.env');
const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');

const backendEnv = {};
for (const line of envVars) {
  if (line.trim() === '' || line.startsWith('#')) {
    continue;
  }
  const [key, value] = line.split('=').map(s => s.trim());
  if (!key.startsWith('VITE_') && key !== '') {
    backendEnv[key] = value;
  }
}

const samEnv = {
  BungieOAuthHandoffFunction: backendEnv
};

fs.writeFileSync('dev-env.json', JSON.stringify(samEnv, null, 2));

console.log('Generated dev-env.json from .env file.');