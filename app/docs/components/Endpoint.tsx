"use client";

import { CodeBlock } from "./CodeBlock";

interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface EndpointProps {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  detailedDescription?: string;
  parameters?: Parameter[];
  requestBody?: string;
  response?: string;
  errors?: { title: string; code: string }[];
  pythonExample?: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

const methodColors: Record<string, string> = {
  GET: "text-[var(--green)]",
  POST: "text-[var(--blue)]",
  PUT: "text-[var(--yellow)]",
  DELETE: "text-[var(--red)]",
};

export function Endpoint({
  id,
  method,
  path,
  description,
  detailedDescription,
  parameters,
  requestBody,
  response,
  errors,
  pythonExample,
  isOpen,
  onToggle,
}: EndpointProps) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-5 text-left hover:bg-[var(--bg-soft)] transition-colors"
        style={{ padding: "10px 16px" }}
      >
        <span className={`font-mono text-sm font-medium w-16 ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-base text-[var(--fg)] flex-1">{path}</code>
        <span className="text-[var(--fg-muted)]">{description}</span>
        <svg
          className={`w-5 h-5 text-[var(--fg-dim)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div style={{ padding: "16px 40px 40px 40px" }}>
            {/* Description */}
            {detailedDescription && (
              <p className="text-[var(--fg-muted)]" style={{ marginBottom: "28px" }}>{detailedDescription}</p>
            )}

            {/* Parameters - full width */}
            {parameters && parameters.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <h4 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider" style={{ marginBottom: "16px" }}>
                  Parameters
                </h4>
                <div className="space-y-4">
                  {parameters.map((param) => (
                    <div key={param.name} className="flex items-start gap-4">
                      <code className="text-[var(--aqua)] bg-[var(--bg-soft)] rounded text-sm" style={{ padding: "4px 10px" }}>
                        {param.name}
                      </code>
                      <span className="text-[var(--fg-dim)]">{param.type}</span>
                      {param.required && (
                        <span className="text-[var(--orange)] text-sm">required</span>
                      )}
                      <span className="text-[var(--fg-muted)] flex-1">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two column section for Request/Response and Python */}
            <div className="flex" style={{ gap: "48px" }}>
              {/* Left side - Request Body & Response */}
              <div className="flex-1 min-w-0" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {requestBody && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider" style={{ marginBottom: "16px" }}>
                      Request Body
                    </h4>
                    <CodeBlock code={requestBody} language="json" />
                  </div>
                )}

                {response && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider" style={{ marginBottom: "16px" }}>
                      Response
                    </h4>
                    <CodeBlock code={response} language="json" />
                  </div>
                )}

                {errors && errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider" style={{ marginBottom: "16px" }}>
                      Errors
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {errors.map((error, idx) => (
                        <div key={idx}>
                          <p className="text-sm text-[var(--fg-dim)]" style={{ marginBottom: "10px" }}>{error.title}</p>
                          <CodeBlock code={error.code} language="json" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Python Example */}
              {pythonExample && (
                <div 
                  className={`flex-shrink-0 transition-all duration-500 ease-out ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  }`}
                  style={{ width: "480px", transitionDelay: isOpen ? "150ms" : "0ms" }}
                >
                  <h4 className="text-sm font-medium text-[var(--fg-dim)] uppercase tracking-wider flex items-center gap-2" style={{ marginBottom: "16px" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                    </svg>
                    Python
                  </h4>
                  <CodeBlock code={pythonExample} language="python" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
