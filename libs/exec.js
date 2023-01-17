import { execSync } from 'child_process'

export function buildAll(config) {
    for (const [key, _] of Object.entries(config.operators)) {
        if (key.startsWith('_')) break;
        console.log(execSync(`O=${key} node runner.js && O=${key} pnpm run build`).toString());
    }
}

export function runDev(config) {
    
}