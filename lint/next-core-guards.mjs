// Focused App Router/Next web-vitals safety rules with no third-party glob
// dependencies. This is NOT an alias or replacement for the full official
// @next/eslint-plugin-next suite; see the coverage map in docs/security.
function jsxName(tag) {
  return tag?.type === 'JSXIdentifier' ? tag.name : null;
}

function attribute(node, name) {
  return node.attributes?.find(
    (entry) => entry.type === 'JSXAttribute' && jsxName(entry.name) === name,
  );
}

function literalAttribute(node, name) {
  const value = attribute(node, name)?.value;
  if (!value) return null;
  if (value.type === 'Literal') return typeof value.value === 'string' ? value.value : null;
  // JSX expression literals, e.g., href={"/dashboard"}.
  if (value.type === 'JSXExpressionContainer' && value.expression?.type === 'Literal') {
    return typeof value.expression.value === 'string' ? value.expression.value : null;
  }
  return null;
}

function jsxRule(message, inspect) {
  return {
    meta: {
      type: 'problem',
      docs: { description: message },
      schema: [],
      messages: { restricted: message },
    },
    create(context) {
      return {
        JSXOpeningElement(node) {
          if (inspect(node, context)) {
            context.report({ node, messageId: 'restricted' });
          }
        },
      };
    },
  };
}

export const nextCoreGuards = {
  meta: { name: 'local-next-core-guards', version: '1.0.0' },
  rules: {
    'no-raw-img': jsxRule(
      'Avoid raw <img> in Next.js pages; use next/image for image optimization.',
      (node) => jsxName(node.name) === 'img',
    ),
    'no-internal-html-link': jsxRule(
      'Use next/link for internal navigation instead of a raw <a href="/...">.',
      (node) => {
        if (jsxName(node.name) !== 'a') return false;
        const href = literalAttribute(node, 'href');
        return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
      },
    ),
    'no-sync-script': jsxRule(
      'Avoid synchronous raw <script src>; use next/script or async/defer.',
      (node) => jsxName(node.name) === 'script' &&
        Boolean(attribute(node, 'src')) &&
        !attribute(node, 'async') &&
        !attribute(node, 'defer'),
    ),
    'no-raw-head': jsxRule(
      'Avoid raw <head> in App Router JSX; use the Next.js Metadata API.',
      (node, context) => jsxName(node.name) === 'head' &&
        /[/\\]app[/\\]/.test(context.filename ?? ''),
    ),
    'no-unsafe-blank-target': jsxRule(
      'External target="_blank" links must set rel="noopener noreferrer".',
      (node) => {
        if (jsxName(node.name) !== 'a' || literalAttribute(node, 'target') !== '_blank') return false;
        const rel = literalAttribute(node, 'rel');
        if (!rel) return true;
        const parts = new Set(rel.toLowerCase().split(/\s+/));
        return !parts.has('noopener') || !parts.has('noreferrer');
      },
    ),
    // No raw stylesheet link tags in Next application JSX.
    'no-css-link': jsxRule(
      'Use Next-supported CSS imports instead of a manual stylesheet <link>.',
      (node) => jsxName(node.name) === 'link' &&
        literalAttribute(node, 'rel')?.toLowerCase() === 'stylesheet',
    ),
    // The historical polyfill.io CDN must not be added to application pages.
    'no-polyfillio-script': jsxRule(
      'Do not load polyfill.io scripts; use supported, reviewed dependencies.',
      (node) => {
        if (!['script', 'Script'].includes(jsxName(node.name))) return false;
        const src = literalAttribute(node, 'src');
        if (typeof src !== 'string') return false;
        try {
          const url = new URL(src);
          return ['http:', 'https:'].includes(url.protocol) &&
            (url.hostname === 'polyfill.io' || url.hostname.endsWith('.polyfill.io'));
        } catch {
          return false;
        }
      },
    ),

    // Inline next/script content requires a stable identifier for safe deduplication.
    'no-inline-script-without-id': jsxRule(
      'Give an inline next/script component a stable id.',
      (node) => {
        if (jsxName(node.name) !== 'Script' || attribute(node, 'src') || attribute(node, 'id')) return false;
        const inline = attribute(node, 'dangerouslySetInnerHTML') ||
          node.parent?.children?.some((child) =>
            (child.type === 'JSXText' && child.value.trim()) ||
            (child.type === 'JSXExpressionContainer' && child.expression?.type !== 'JSXEmptyExpression'));
        return Boolean(inline);
      },
    ),
    // beforeInteractive is supported for Pages router _document (App Router uses layout).
    'no-beforeinteractive-outside-document': jsxRule(
      'Do not use beforeInteractive in pages/ outside _document.',
      (node, context) => {
        const file = (context.filename ?? '').replaceAll(String.fromCharCode(92), '/');
        return jsxName(node.name) === 'Script' &&
          literalAttribute(node, 'strategy') === 'beforeInteractive' &&
          file.includes('/pages/') && !/\/pages\/_document\.[jt]sx?$/.test(file);
      },
    ),
    'no-styled-jsx-in-document': jsxRule(
      'styled-jsx cannot be placed in a Pages Router _document.',
      (node, context) =>
        /[/\\]pages[/\\]_document\.[jt]sx?$/.test(context.filename ?? '') &&
        jsxName(node.name) === 'style' && Boolean(attribute(node, 'jsx')),
    ),
    'no-next-script-in-head': jsxRule(
      'Do not nest next/script inside a Head component; place Script outside Head.',
      (node) => {
        if (jsxName(node.name) !== 'Script') return false;
        let current = node.parent?.parent;
        while (current) {
          if (current.type === 'JSXElement' && jsxName(current.openingElement?.name) === 'Head')
            return true;
          current = current.parent;
        }
        return false;
      },
    ),
    'no-async-client-component': {
      meta: {
        type: 'problem',
        docs: { description: 'Async components cannot be Client Components.' },
        schema: [],
        messages: { restricted: 'A use client module cannot declare an async React component.' },
      },
      create(context) {
        let client = false;
        const componentName = (name) => /^[A-Z]/.test(name ?? '');
        const asyncFunction = (node) => node?.async &&
          ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type);
        return {
          Program(node) {
            client = node.body.some((statement) =>
              statement.type === 'ExpressionStatement' &&
              statement.expression?.type === 'Literal' &&
              statement.expression.value === 'use client');
          },
          ExportDefaultDeclaration(node) {
            if (client && ((node.declaration?.type === 'FunctionDeclaration' &&
              node.declaration.async) || asyncFunction(node.declaration)))
              context.report({ node, messageId: 'restricted' });
          },
          FunctionDeclaration(node) {
            if (client && node.async && componentName(node.id?.name) &&
                node.parent?.type !== 'ExportDefaultDeclaration')
              context.report({ node, messageId: 'restricted' });
          },
          VariableDeclarator(node) {
            if (client && componentName(node.id?.name) && asyncFunction(node.init))
              context.report({ node, messageId: 'restricted' });
          },
        };
      },
    },
    'no-next-head-in-document': {
      meta: {
        type: 'problem',
        docs: { description: 'Pages Router _document must use next/document Head.' },
        schema: [],
        messages: { restricted: 'Use Head from next/document, not next/head, in _document.' },
      },
      create(context) {
        const inDocument = /[/\\]pages[/\\]_document\.[jt]sx?$/.test(context.filename ?? '');
        return {
          ImportDeclaration(node) {
            if (inDocument && node.source.value === 'next/head')
              context.report({ node, messageId: 'restricted' });
          },
        };
      },
    },
    'no-next-head-in-app': {
      meta: {
        type: 'problem',
        docs: { description: 'next/head is not supported in App Router components.' },
        schema: [],
        messages: { restricted: 'Use the App Router metadata API instead of next/head in app/.' },
      },
      create(context) {
        const inApp = (context.filename ?? '').replaceAll(String.fromCharCode(92), '/').includes('/app/');
        return {
          ImportDeclaration(node) {
            if (inApp && node.source.value === 'next/head') {
              context.report({ node, messageId: 'restricted' });
            }
          },
        };
      },
    },
    'no-next-document-outside-document': {
      meta: {
        type: 'problem',
        docs: { description: 'next/document may only be imported from pages/_document.' },
        schema: [],
        messages: { restricted: 'Import next/document only from pages/_document.' },
      },
      create(context) {
        const file = (context.filename ?? '').replaceAll(String.fromCharCode(92), '/');
        const inDocument = /\/pages\/_document\.[jt]sx?$/.test(file);
        return {
          ImportDeclaration(node) {
            if (!inDocument && node.source.value === 'next/document')
              context.report({ node, messageId: 'restricted' });
          },
        };
      },
    },
  },
};
