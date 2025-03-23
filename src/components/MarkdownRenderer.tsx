import { marked } from 'marked';

export const MarkdownRenderer = ({ content }: { content: string }) => {
  const html = marked.parse(content);
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.6',
        fontSize: '1rem',
        padding: '0 1rem',
        color: '#000000',
      }}
    />
  );
}; 