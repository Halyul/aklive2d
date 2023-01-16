import { execSync } from 'child_process'

export default function (config) {
    for (const [key, _] of Object.entries(config.operators)) {
        if (key.startsWith('_')) break;
        console.log(execSync(`O=${key} node preprocessing.js && O=${key} pnpm run build`).toString());
    }
}