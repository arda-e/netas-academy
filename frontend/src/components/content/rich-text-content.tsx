import { cn } from "@/lib/utils";
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
] as const

const ALLOWED_ATTR = [
  "class", "id", "title", "lang", "dir",
  "href", "target", "rel", "download",
  "src", "alt", "width", "height", "loading",
  "colspan", "rowspan", "scope",
  "style",
] as const

type RichTextContentProps = {
  content: string;
  className?: string;
};

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function RichTextContent({ content, className }: RichTextContentProps) {
  const sanitized = sanitizeHtml(content);

  return (
    <div
      className={cn(
        "prose prose-invert max-w-none whitespace-pre-wrap text-base leading-7 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 sm:leading-8",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
