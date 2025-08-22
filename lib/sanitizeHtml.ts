import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
const window = new JSDOM('').window as any;
const DOMPurify = createDOMPurify(window);
export const sanitizeHtml = (html: string) => DOMPurify.sanitize(html);
