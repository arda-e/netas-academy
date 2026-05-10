import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "del", "ins",
  "sub", "sup", "code", "kbd", "mark", "abbr", "cite", "small",
  "a",
  "ul", "ol", "li",
  "blockquote", "pre",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "div", "span",
];

const ALLOWED_ATTR = [
  "class", "id", "title", "lang", "dir",
  "href", "target", "rel", "download",
  "src", "alt", "width", "height", "loading",
  "colspan", "rowspan", "scope",
  "style",
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
