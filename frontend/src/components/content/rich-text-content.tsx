import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

type RichTextContentProps = {
  content: string;
  className?: string;
};

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
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
