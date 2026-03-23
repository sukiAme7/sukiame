const katex = require('katex');

const INLINE_PLACEHOLDER_PREFIX = '@@CODE_SPAN_';

const renderKatex = (tex, displayMode) => katex.renderToString(tex.trim(), {
  displayMode,
  throwOnError: false,
  strict: 'ignore',
  output: 'html'
});

const replaceInlineCode = (text) => {
  const placeholders = [];
  const content = text.replace(/(`+)([\s\S]*?)\1/g, (match) => {
    const token = `${INLINE_PLACEHOLDER_PREFIX}${placeholders.length}@@`;
    placeholders.push(match);
    return token;
  });

  return {
    content,
    restore(value) {
      return placeholders.reduce((acc, item, index) => acc.replace(`${INLINE_PLACEHOLDER_PREFIX}${index}@@`, item), value);
    }
  };
};

const renderMathInSegment = (segment) => {
  const { content, restore } = replaceInlineCode(segment);

  let result = content.replace(/(^|\n)\$\$\s*\n?([\s\S]*?)\n?\$\$(?=\n|$)/g, (match, leading, expr) => {
    const rendered = renderKatex(expr, true);
    return `${leading}\n<div class="math-block">${rendered}</div>\n`;
  });

  result = result.replace(/(^|[^\\$])\$([^$\n]+?)\$(?!\$)/g, (match, prefix, expr) => {
    const rendered = renderKatex(expr, false);
    return `${prefix}${rendered}`;
  });

  return restore(result);
};

const transformMarkdown = (content) => {
  const lines = content.split(/\r?\n/);
  const output = [];
  let buffer = [];
  let inFence = false;
  let fenceMarker = '';

  const flushBuffer = () => {
    if (!buffer.length) return;
    output.push(renderMathInSegment(buffer.join('\n')));
    buffer = [];
  };

  lines.forEach((line) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);

    if (fenceMatch) {
      const marker = fenceMatch[1];

      if (!inFence) {
        flushBuffer();
        inFence = true;
        fenceMarker = marker[0];
        output.push(line);
        return;
      }

      if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = '';
      }

      output.push(line);
      return;
    }

    if (inFence) {
      output.push(line);
      return;
    }

    buffer.push(line);
  });

  flushBuffer();
  return output.join('\n');
};

hexo.extend.filter.register('before_post_render', (data) => {
  if (!data || !data.content) return data;

  data.content = transformMarkdown(data.content);
  return data;
});

hexo.extend.filter.register('before_render:markdown', (data) => {
  if (!data || typeof data.text !== 'string') return data;

  data.text = transformMarkdown(data.text);
  return data;
});
