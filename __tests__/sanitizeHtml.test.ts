import { sanitizeHtml } from '../lib/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("x")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('<p>Hello</p>');
    expect(clean).not.toContain('<script>');
  });
});
