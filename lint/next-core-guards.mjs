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
    'no-next-document-in-app': {
      meta: {
        type: 'problem',
        docs: { description: 'next/document is unsupported in App Router modules' },
        schema: [],
        messages: { restricted: 'Do not import next/document from app/ files.' },
      },
      create(context) {
        const withinApp = /[/\\]app[/\\]/.test(context.filename ?? '');
        return {
          ImportDeclaration(node) {
            if (withinApp && node.source.value === 'next/document') {
              context.report({ node, messageId: 'restricted' });
            }
          },
        };
      },
    },
  },
};

export default nextCoreGuards;
