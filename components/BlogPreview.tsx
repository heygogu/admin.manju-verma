"use client";

interface BlogPreviewProps {
  content: string;
}

export default function BlogPreview({ content }: BlogPreviewProps) {
  console.log(content);

  if (!content?.trim()) {
    return (
      <div className='rounded-md border p-4 mt-8'>
        <h2 className='text-xl font-semibold mb-4'>Live Preview</h2>
        <p className='text-gray-500 italic'>Nothing to preview yet...</p>
      </div>
    );
  }

  return (
    <div className='rounded-md border p-4 mt-8'>
      <h2 className='text-xl font-semibold mb-4'>Live Preview</h2>
      <div className='max-w-none'>
        <style jsx>{`
          .blog-content h1 {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            margin-top: 1.5rem;
          }
          .blog-content h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.75rem;
            margin-top: 1.25rem;
          }
          .blog-content h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
          }
          .blog-content p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }
          .blog-content strong {
            font-weight: 600;
          }
          .blog-content code {
            background-color: rgb(243 244 246);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: "Courier New", monospace;
          }
          .blog-content ul {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          .blog-content li {
            margin-bottom: 0.5rem;
          }
          .blog-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
          }
          @media (prefers-color-scheme: dark) {
            .blog-content code {
              background-color: rgb(55 65 81);
            }
            .blog-content blockquote {
              border-left-color: rgb(75 85 99);
            }
          }
        `}</style>
        <div
          className='blog-content'
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
