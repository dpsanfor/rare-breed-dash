import React from "react";

/**
 * Lightweight markdown renderer for AI-generated reports.
 * Handles headings (#/##/###/####), **bold**, *italic*, `code`,
 * > blockquotes, --- horizontal rules, and - / * / 1. lists.
 * No external dependency, styled to match the Rare Breed report cards.
 */

// Parse inline formatting: **bold**, *italic* / _italic_, `code`
function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match **bold**, *italic*, _italic_, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-[#1F1623]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-[rgba(74,18,89,0.06)] px-1.5 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      // *italic* or _italic_
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: string) => {
    if (!listBuffer) return;
    const { ordered, items } = listBuffer;
    const cls = "mb-4 ml-5 space-y-1 " + (ordered ? "list-decimal" : "list-disc");
    blocks.push(
      ordered ? (
        <ol key={key} className={cls}>
          {items.map((it, j) => (
            <li key={j}>{parseInline(it, `${key}-${j}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key} className={cls}>
          {items.map((it, j) => (
            <li key={j}>{parseInline(it, `${key}-${j}`)}</li>
          ))}
        </ul>
      )
    );
    listBuffer = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const key = `md-${i}`;

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushList(key + "-l");
      blocks.push(<hr key={key} className="my-6 border-[rgba(74,18,89,0.12)]" />);
      return;
    }

    // Headings (#, ##, ###, ####)
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList(key + "-l");
      const level = heading[1].length;
      const content = parseInline(heading[2], key);
      const cls =
        level <= 2
          ? "font-display mt-8 mb-3 text-2xl tracking-wide text-[#1F1623]"
          : level === 3
            ? "font-display mt-8 mb-2 text-xl tracking-wide text-[#1F1623]"
            : "font-display mt-6 mb-2 text-lg tracking-wide text-[#1F1623]";
      blocks.push(
        <h3 key={key} className={cls}>
          {content}
        </h3>
      );
      return;
    }

    // Blockquote
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushList(key + "-l");
      blocks.push(
        <blockquote
          key={key}
          className="my-4 border-l-2 border-[#E0249C] pl-5 text-[#1F1623]/70 italic"
        >
          {parseInline(quote[1].replace(/^\*+|\*+$/g, ""), key)}
        </blockquote>
      );
      return;
    }

    // Ordered list item
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ol) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList(key + "-l");
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(ol[1]);
      return;
    }

    // Unordered list item
    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ul) {
      if (!listBuffer || listBuffer.ordered) {
        flushList(key + "-l");
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(ul[1]);
      return;
    }

    // Blank line
    if (line.trim() === "") {
      flushList(key + "-l");
      return;
    }

    // Paragraph
    flushList(key + "-l");
    blocks.push(
      <p key={key} className="mb-3">
        {parseInline(line, key)}
      </p>
    );
  });

  flushList("md-final");

  return <div className={className}>{blocks}</div>;
}

export default Markdown;
