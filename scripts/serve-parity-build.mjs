import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';

const args = process.argv.slice(2);
function argument(name) {
    const index = args.indexOf(name);
    if (index < 0 || !args[index + 1]) throw new Error(`Missing ${name}`);
    return args[index + 1];
}
const root = path.resolve(argument('--directory'));
const port = Number(argument('--port'));
if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('Invalid port');
await stat(path.join(root, 'index.html'));

const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.avif': 'image/avif',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.xml': 'application/xml',
};
const server = http.createServer(async (request, response) => {
    try {
        if (!['GET', 'HEAD'].includes(request.method)) {
            response.writeHead(405).end();
            return;
        }
        const pathname = decodeURIComponent(
            new URL(request.url, 'http://localhost').pathname,
        );
        let file = path.resolve(root, `.${pathname}`);
        if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
            response.writeHead(403).end();
            return;
        }
        try {
            if ((await stat(file)).isDirectory())
                file = path.join(file, 'index.html');
            await stat(file);
        } catch {
            if (path.extname(pathname)) {
                response.writeHead(404).end('Missing asset');
                return;
            }
            file = path.join(root, 'index.html');
        }
        const body = await readFile(file);
        response.writeHead(200, {
            'Content-Type':
                types[path.extname(file)] || 'application/octet-stream',
            'Cache-Control': 'no-store',
        });
        response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
        response.writeHead(400).end('Invalid request');
    }
});
server.listen(port, '127.0.0.1', () =>
    console.log(`Serving ${root} at http://127.0.0.1:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => server.close());
