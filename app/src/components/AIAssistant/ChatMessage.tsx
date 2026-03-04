import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessageProps } from '../../types/ai';

const messageRowStyle: Record<string, React.CSSProperties> = {
  user: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '4px 0',
  },
  assistant: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '4px 0',
  },
};

const bubbleStyle: Record<string, React.CSSProperties> = {
  user: {
    maxWidth: '85%',
    padding: '8px 12px',
    borderRadius: '12px 12px 2px 12px',
    backgroundColor: '#1E3A5F',
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: '20px',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  assistant: {
    maxWidth: '90%',
    padding: '8px 12px',
    borderRadius: '12px 12px 12px 2px',
    backgroundColor: '#1F2937',
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: '20px',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
};

const markdownStyles = `
  .csog-md p { margin: 0 0 8px 0; }
  .csog-md p:last-child { margin-bottom: 0; }
  .csog-md h1, .csog-md h2, .csog-md h3, .csog-md h4 {
    margin: 12px 0 6px 0;
    font-weight: 600;
    color: #F9FAFB;
  }
  .csog-md h1 { font-size: 18px; }
  .csog-md h2 { font-size: 16px; }
  .csog-md h3 { font-size: 15px; }
  .csog-md h4 { font-size: 14px; }
  .csog-md ul, .csog-md ol {
    margin: 4px 0;
    padding-left: 20px;
  }
  .csog-md li { margin: 2px 0; }
  .csog-md code {
    background-color: rgba(255,255,255,0.08);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
  }
  .csog-md pre {
    background-color: rgba(0,0,0,0.3);
    border-radius: 6px;
    padding: 10px 12px;
    overflow-x: auto;
    margin: 8px 0;
  }
  .csog-md pre code {
    background: none;
    padding: 0;
    font-size: 13px;
    line-height: 18px;
  }
  .csog-md table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    font-size: 13px;
  }
  .csog-md th, .csog-md td {
    border: 1px solid #374151;
    padding: 4px 8px;
    text-align: left;
  }
  .csog-md th {
    background-color: rgba(255,255,255,0.05);
    font-weight: 600;
  }
  .csog-md strong { color: #F9FAFB; }
  .csog-md em { color: #D1D5DB; }
  .csog-md blockquote {
    border-left: 3px solid #4B5563;
    padding-left: 10px;
    margin: 8px 0;
    color: #9CA3AF;
  }
  .csog-md a {
    color: #60A5FA;
    text-decoration: underline;
  }
  .csog-cursor {
    display: inline-block;
    width: 2px;
    height: 16px;
    background-color: #60A5FA;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isStreaming = false,
}) => {
  return (
    <>
      <style>{markdownStyles}</style>
      <div style={messageRowStyle[role]} role="listitem">
        <div style={bubbleStyle[role]}>
          {role === 'user' ? (
            <span>{content}</span>
          ) : (
            <div className="csog-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isStreaming && <span className="csog-cursor" aria-hidden="true">▌</span>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
