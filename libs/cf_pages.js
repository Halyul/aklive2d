/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pThrottle from 'p-throttle';
import { spawnSync } from 'child_process';
import { readdirSync, fileTypeSync, writeSync, mkdir, exists } from './file.js';
//TODO: Utilizing github actions to upload base.zip and update.zip
export default class CFPages {
    #uploadPath = path.join(__projectRoot, __config.folder.operator_data);
    #downloadPath = path.join(__projectRoot, __config.folder.operator_data);
    #gitignorePath = path.join(__projectRoot, '.gitignore');

    async upload() {
        const tree = await this.#generateDirTree(this.#uploadPath);
        writeSync(JSON.stringify(tree, null), path.join(this.#uploadPath, 'index.json'));
        const wrangler = spawnSync('pnpm', ['wrangler', 'pages', 'deploy', this.#uploadPath, "--project-name", __config.akassets.project_name]);

        console.log('error', wrangler.error);
        console.log('stdout ', wrangler.stdout.toString());
        console.log('stderr ', wrangler.stderr.toString());
    }

    async download() {
        const indexFile = `${__config.akassets.url}/index.json`
        const resp = await fetch(indexFile);
        const data = await resp.json();
        if (!exists(this.#downloadPath)) mkdir(this.#downloadPath);
        let list = data.children.flatMap((child) => {
            return this.#generateDownloadList(child, this.#downloadPath);
        });
        const throttle = pThrottle({
            limit: 10,
            interval: 100
        })
        while (list.length > 0) {
            const retry = [];
            await Promise.all(list.map(throttle(async (file) => {
                let isExists = false;
                let suppressedPath = file.target.replace(this.#downloadPath, '');
                if (exists(file.target)) {
                    const hash = await this.#getHash(file.target);
                    if (hash === file.hash) {
                        isExists = true
                        // console.log("File already exists and hash matches:", suppressedPath);
                    }
                }
                if (!isExists) {
                    await fetch(file.url)
                        .then(response => {
                            return response.arrayBuffer();
                        })
                        .then(arraybuffer => {
                            console.log("Writing to file:", suppressedPath);
                            writeSync(Buffer.from(arraybuffer), file.target);
                            return this.#getHash(file.target)
                        })
                        .then(hash => {
                            if (hash !== file.hash) {
                                throw new Error(`Hash mismatch`);
                            }
                        })
                        .catch(err => {
                            console.log(`Found error for ${suppressedPath}:`, err)
                            retry.push(file);
                        });
                }
            })));
            list = retry;
        }
    }

    #generateDownloadList(data, baseDir, baseUrl = "") {
        if (data.type === 'dir') {
            let list = [];
            const curDir = path.join(baseDir, data.name);
            mkdir(curDir);
            if (data.children.length > 0) {
                for (const child of data.children) {
                    const filesToDownload = this.#generateDownloadList(child, curDir, baseUrl + data.name + '/');
                    if (filesToDownload) {
                        list = [...list, ...filesToDownload];
                    }
                }
                return list;
            }
        } else {
            return [{
                url: `${__config.akassets.url}/${baseUrl + data.name.replace('#', '%23')}`,
                target: path.join(baseDir, data.name),
                hash: data.hash
            }]
        }
        return null;
    }

    async #generateDirTree(dir) {
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
                const children = await this.#generateDirTree(filePath);
                if (children) tree.children.push(children);
            } else {
                tree.children.push({
                    name: file,
                    type: 'file',
                    hash: await this.#getHash(filePath)
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

    #getHash(filePath) {
        return new Promise((res, rej) => {
            const hash = crypto.createHash('md5');
            const rStream = fs.createReadStream(filePath);
            rStream.on('data', (data) => {
                hash.update(data);
            });
            rStream.on('end', () => {
                res(hash.digest('hex'));
            });
        })
    }
}