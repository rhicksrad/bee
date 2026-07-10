// Minimal markdown renderer. All input is HTML-escaped first, so the
// output is safe to inject even for user-submitted text. Supports:
// # headings, **bold**, *italic*, `code`, [links](https://...),
// ![images](https://...), - bullet lists, and blank-line paragraphs.

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy" />'
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export function renderMarkdown(source: string): string {
  const blocks = escapeHtml(source.replace(/\r\n/g, '\n')).split(/\n{2,}/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length + 2; // h3..h5 to fit page hierarchy
        return `<h${level}>${renderInline(heading[2])}</h${level}>`;
      }

      const lines = trimmed.split('\n');
      if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
        const items = lines
          .map((line) => `<li>${renderInline(line.trim().replace(/^[-*]\s+/, ''))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      return `<p>${renderInline(lines.join('<br />'))}</p>`;
    })
    .filter(Boolean)
    .join('');
}
