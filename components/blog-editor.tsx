"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState, useCallback } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className='h-64 bg-gray-100 animate-pulse rounded-md' />,
});

interface BlogEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
}

export default function BlogEditor({
  initialContent = "",
  onChange,
  placeholder = "Start writing your blog post...",
  height = "300px",
}: BlogEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only update content when initialContent changes from external source
  // and it's different from current content
  useEffect(() => {
    if (initialContent !== content && initialContent !== "") {
      setContent(initialContent);
    }
  }, [initialContent]); // Removed content from dependencies to prevent loop

  // Handle content changes from the editor
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      onChange(value); // Call onChange immediately when user types
    },
    [onChange]
  );

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  if (!isMounted) {
    return <div className='h-64 bg-gray-100 animate-pulse rounded-md' />;
  }

  return (
    <div className='w-full'>
      <style jsx global>{`
        .ql-editor {
          min-height: ${height};
          font-size: 16px;
          line-height: 1.6;
        }
        .ql-container {
          font-size: 16px;
        }
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
        }
        .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
        }
      `}</style>
      <ReactQuill
        theme='snow'
        value={content}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: "white",
        }}
      />
    </div>
  );
}
