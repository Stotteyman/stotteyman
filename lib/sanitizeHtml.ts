import createDOMPurify from 'dompurify';

// DOMPurify can run in both browser and Node environments. When running
// on the server (or in tests) there is no global `window` available, so
// we lazily require `jsdom` only in that scenario. This avoids bundling
// `jsdom` – and its Node-only dependencies such as `net` and `tls` – in
// the client build, which previously caused Next.js to fail during the
// Netlify deploy.
let DOMPurify: ReturnType<typeof createDOMPurify>;

if (typeof window === 'undefined') {
  // Node environment: create a minimal window with jsdom for DOMPurify
  // to attach to. Using `require` ensures `jsdom` is excluded from the
  // client bundle.
  const { JSDOM } = require('jsdom');
  const { window } = new JSDOM('');
  DOMPurify = createDOMPurify(window as unknown as Window);
} else {
  // Browser environment: use the existing window
  DOMPurify = createDOMPurify(window);
}

export const sanitizeHtml = (html: string) => DOMPurify.sanitize(html);
