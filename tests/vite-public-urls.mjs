import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

export const vitePublicUrls = {
  name: 'vite-public-urls',
  setup(build) {
    build.onResolve({ filter: /^\/[^/]/ }, ({ kind, path }) => {
      if (kind !== 'url-token') return;
      const file = resolve(publicDir, '.' + path.split(/[?#]/, 1)[0]);
      if (file.startsWith(publicDir + sep) && statSync(file, { throwIfNoEntry: false })?.isFile()) {
        return { path, external: true };
      }
    });
  },
};
