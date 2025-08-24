import { sanitizeHtml } from '../lib/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("x")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('<p>Hello</p>');
    expect(clean).not.toContain('<script>');
  });

  it('strips inline event handlers', () => {
    const dirty = '<img src="x" onerror="alert(1)">';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('<img src="x">');
    expect(clean).not.toContain('onerror');
  });

  it('handles malformed tags', () => {
    const dirty = '<img src="x" onerror="alert(1)>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('');
  });

  it('sanitizes style injections', () => {
    const dirty = '<div style="background-image: url("javascript:alert(1)")">';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('alert');
  });

  it('preserves valid markup', () => {
    const dirty = '<p><em>Safe</em> content</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe(dirty);
  });
});
