// Renders the CMS's lightweight text format as React elements (never as raw HTML, so content can't inject scripts).
// Supported: blank-line separated paragraphs, "## Heading", "### Subheading", "- bullet" lists,
// "1. numbered" lists, **bold** and [link text](https://...) inline.
const SAFE_URL = /^(https:\/\/|mailto:|\/(?!\/))/;

function inline(text, keyPrefix) {
  const parts = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) parts.push(<strong key={`${keyPrefix}-${i++}`}>{match[1]}</strong>);
    else if (SAFE_URL.test(match[3])) {
      const external = match[3].startsWith('https://');
      parts.push(
        <a key={`${keyPrefix}-${i++}`} href={match[3]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {match[2]}
        </a>
      );
    } else parts.push(match[2]);
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function parseBlocks(source = '') {
  const blocks = [];
  let list = null;
  let para = [];
  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    let m;
    if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      flushPara();
      flushList();
      blocks.push({ type: m[1].length === 2 ? 'h2' : 'h3', text: m[2] });
    } else if ((m = line.match(/^[-*]\s+(.*)$/)) || (m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      const ordered = /^\d/.test(line);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: 'list', ordered, items: [] };
      }
      list.items.push(m[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export default function RichText({ text, className = 'prose-3dp' }) {
  const blocks = parseBlocks(text);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === 'h2') return <h2 key={i}>{inline(b.text, i)}</h2>;
        if (b.type === 'h3') return <h3 key={i}>{inline(b.text, i)}</h3>;
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul';
          return (
            <Tag key={i}>
              {b.items.map((item, j) => (
                <li key={j}>{inline(item, `${i}-${j}`)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{inline(b.text, i)}</p>;
      })}
    </div>
  );
}

// First paragraph only, as plain text (for previews).
export function firstParagraph(text = '') {
  const block = parseBlocks(text).find((b) => b.type === 'p');
  return block ? block.text.replace(/\*\*/g, '') : '';
}
