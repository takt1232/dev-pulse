import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { USERS } from './constants';

interface MarkdownProps {
  content: string;
  onToggleCheckbox?: (index: number, checked: boolean) => void;
  interactiveCheckboxes?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({
  content,
  onToggleCheckbox,
  interactiveCheckboxes = false,
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let listItems: { text: string; isChecked?: boolean; isCheckbox?: boolean; rawIndex?: number }[] = [];
  let isNumberedList = false;
  let checkboxCount = 0;

  const renderInline = (text: string) => {
    // 1. Highlight @mentions
    const userNames = USERS.map(u => u.name.split(' ')[0]);
    
    // Split by code chunks first
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-xs font-medium border border-slate-200 dark:border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Check for @mentions and links and bold
      let tokens: React.ReactNode[] = [part];

      // Handle @mentions
      const mentionRegex = /(@[A-Za-z0-9_]+)/g;
      tokens = tokens.flatMap((token, tIdx) => {
        if (typeof token !== 'string') return token;
        const subParts = token.split(mentionRegex);
        return subParts.map((sub, sIdx) => {
          if (sub.startsWith('@')) {
            const name = sub.slice(1);
            const user = USERS.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
            return (
              <span
                key={`${tIdx}-${sIdx}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium text-xs border border-indigo-200/80 dark:border-indigo-800 mx-0.5"
                title={user ? `${user.name} (${user.role})` : sub}
              >
                {sub}
              </span>
            );
          }
          return sub;
        });
      });

      // Handle bold
      tokens = tokens.flatMap((token, tIdx) => {
        if (typeof token !== 'string') return token;
        const boldParts = token.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bSub, bIdx) => {
          if (bSub.startsWith('**') && bSub.endsWith('**') && bSub.length >= 4) {
            return (
              <strong key={`${tIdx}-${bIdx}`} className="font-semibold text-slate-900 dark:text-slate-100">
                {bSub.slice(2, -2)}
              </strong>
            );
          }
          return bSub;
        });
      });

      return <React.Fragment key={pIdx}>{tokens}</React.Fragment>;
    });
  };

  const flushList = () => {
    if (listItems.length === 0) return;

    elements.push(
      <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
        {listItems.map((item, idx) => {
          if (item.isCheckbox) {
            const curCheckIdx = item.rawIndex ?? idx;
            return (
              <li key={idx} className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  disabled={!interactiveCheckboxes}
                  onChange={(e) => onToggleCheckbox?.(curCheckIdx, e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-75 cursor-pointer disabled:cursor-default"
                />
                <span className={item.isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                  {renderInline(item.text)}
                </span>
              </li>
            );
          }
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-slate-400 select-none mt-0.5">•</span>
              <span>{renderInline(item.text)}</span>
            </li>
          );
        })}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockContent.join('\n');
        elements.push(<CodeSnippetBlock key={`code-${index}`} code={codeText} lang={codeBlockLang} />);
        codeBlockContent = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
          {renderInline(line.replace('# ', ''))}
        </h1>
      );
      return;
    }

    // Checkboxes: - [ ] or - [x]
    const checkboxMatch = line.match(/^(\s*[-*]\s+)\[([ xX])\]\s+(.*)$/);
    if (checkboxMatch) {
      const isChecked = checkboxMatch[2].toLowerCase() === 'x';
      const text = checkboxMatch[3];
      listItems.push({ text, isChecked, isCheckbox: true, rawIndex: checkboxCount++ });
      return;
    }

    // Bullet lists: - item or * item
    const bulletMatch = line.match(/^(\s*[-*]\s+)(.*)$/);
    if (bulletMatch) {
      listItems.push({ text: bulletMatch[2], isCheckbox: false });
      return;
    }

    // Blockquote: > text
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={index} className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-3 py-1 my-2 text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 rounded-r">
          {renderInline(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      flushList();
      return;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={index} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1.5">
        {renderInline(line)}
      </p>
    );
  });

  // End flush
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(<CodeSnippetBlock key="code-end" code={codeBlockContent.join('\n')} lang={codeBlockLang} />);
  }
  flushList();

  return <div className="space-y-1">{elements}</div>;
};

const CodeSnippetBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/80 text-[11px] text-slate-400">
        <span>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="text-emerald-300 font-mono leading-relaxed">{code}</pre>
      </div>
    </div>
  );
};
