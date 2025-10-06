"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";

interface CollapsibleMarkdownProps {
  content: string;
  maxChars?: number;
}

export default function CollapsibleMarkdown({
  content,
  maxChars = 200,
}: CollapsibleMarkdownProps) {
  const [expanded, setExpanded] = useState(false);

  const displayContent = expanded
    ? content
    : content.length > maxChars
    ? content.slice(0, maxChars) + "..."
    : content;

  return (
    <div className="text-sm">
      <div data-color-mode="light">
        <MDEditor.Markdown
          source={displayContent}
          className="[&_ul]:list-disc [&_ol]:list-decimal"
        />
      </div>

      {content.length > maxChars && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-blue-600 hover:underline text-xs"
        >
          {expanded ? "Read less ▲" : "Read more ▼"}
        </button>
      )}
    </div>
  );
}
