"use client";

interface QuillContentRendererProps {
  content: string;
  className?: string;
}

export default function QuillContentRenderer({
  content,
  className = "",
}: QuillContentRendererProps) {
  return (
    <div
      className={`quill-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
