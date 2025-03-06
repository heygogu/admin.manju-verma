// components/MarkdownRenderer.tsx
import React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const htmlString = unified()
    .use(remarkParse)       // Parse Markdown
    .use(remarkGfm)         // Enable GFM (tables, etc.)
    .use(remarkRehype)      // Convert Markdown to HTML
    .use(rehypeStringify)   // Convert HTML to string
    .processSync(markdown)
    .toString();

  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
};

export default MarkdownRenderer;