/* eslint-disable no-undef */
import path from 'path';
import { spawnSync } from 'child_process';
import { readdirSync, fileTypeSync, writeSync } from './file.js';

export default class CFPages {
    #uploadPath = path.join(__projectRoot, __config.folder.operator_data);
    #gitignorePath = path.join(__projectRoot, '.gitignore');

    constructor() {
        
    }

    upload() {
        const tree = this.#generateDirTree(this.#uploadPath);
        writeSync(JSON.stringify(tree, null), path.join(this.#uploadPath, 'index.json'));
        const wrangler = spawnSync('pnpm', ['wrangler', 'pages', 'deploy', this.#uploadPath]);

        console.log('error', wrangler.error);
        console.log('stdout ', wrangler.stdout.toString());
        console.log('stderr ', wrangler.stderr.toString());
    }

    download() {

    }

    #generateDirTree(dir) {
        const files = readdirSync(dir);
        let tree = {
            name: path.basename(dir),
            type: 'dir',
            children: []
        };
        for (const file of files) {
            if (this.#isToIgnore(file)) {
                continue;
            }
            const filePath = path.join(dir, file);
            const dirType = fileTypeSync(filePath);
            if (dirType === 'dir') {
                tree.children.push(this.#generateDirTree(filePath))
            } else {
                tree.children.push({
                    name: file,
                    type: 'file'
                });
            }
        }
        if (tree.children.length === 0) {
            return null;
        }
        return tree
    }

    // TODO
    #isToIgnore(file) {
        switch (file) {
            case '.DS_Store':
            case 'index.json':
                return true;
            default:
                return false;
        }
    }
}