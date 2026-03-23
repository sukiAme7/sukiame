const fs = require('fs');
const path = require('path');

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const copyDirectory = (sourceDir, targetDir) => {
  ensureDir(targetDir);

  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      return;
    }

    fs.copyFileSync(sourcePath, targetPath);
  });
};

hexo.extend.filter.register('after_generate', () => {
  const katexCssPath = require.resolve('katex/dist/katex.min.css');
  const katexRoot = path.dirname(katexCssPath);
  const targetRoot = path.join(hexo.public_dir, 'vendor', 'katex');

  ensureDir(targetRoot);
  fs.copyFileSync(katexCssPath, path.join(targetRoot, 'katex.min.css'));
  copyDirectory(path.join(katexRoot, 'fonts'), path.join(targetRoot, 'fonts'));
});
