import ReactMarkdown from "react-markdown";

export function MarkdownArticle({ content }: { content: string }) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
