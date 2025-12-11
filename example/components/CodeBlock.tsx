"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 px-3 py-1.5 text-sm rounded bg-[var(--border)] hover:bg-[var(--fg-dim)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-5 rounded-lg text-sm leading-relaxed overflow-x-auto bg-[var(--bg-soft)] border border-[var(--border)]"
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
