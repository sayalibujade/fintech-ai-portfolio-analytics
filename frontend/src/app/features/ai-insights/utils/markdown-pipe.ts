import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let html = value;
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 1. Process Structured Table Matrices
      if (line.startsWith('|')) {
        if (line.includes('---')) continue; 
        
        if (!inTable) {
          inTable = true;
          tableHtml += '<div class="table-responsive"><table class="dashboard-data-table">';
        }

        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const tag = tableHtml.includes('<thead>') ? 'td' : 'th';
        
        if (tag === 'th' && !tableHtml.includes('<thead>')) {
          tableHtml += '<thead><tr>';
          cells.forEach(c => tableHtml += `<th>${this.parseInlineMarkdown(c)}</th>`);
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr>';
          cells.forEach(c => tableHtml += `<td>${this.parseInlineMarkdown(c)}</td>`);
          tableHtml += '</tr>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          lines[i] = tableHtml + '\n' + lines[i];
          tableHtml = '';
        }
      }
    }
    
    // 2. Loop lines to transform Headings, Dividers, and List Envelopes cleanly
    const processedLines = lines.join('\n').split('\n').map(line => {
      const trimmed = line.trim();

      // Fixes heading transformation matches reliably by matching current line text directly
      if (trimmed.startsWith('### ')) {
        return `<h4 class="analysis-heading">${this.parseInlineMarkdown(trimmed.substring(4))}</h4>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h3 class="analysis-subheading">${this.parseInlineMarkdown(trimmed.substring(3))}</h3>`;
      }
      if (trimmed === '---') {
        return '<hr class="analysis-divider" />';
      }
      if (trimmed.startsWith('* ')) {
        return `<li class="analysis-list-item">${this.parseInlineMarkdown(trimmed.substring(2))}</li>`;
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return `<li class="analysis-ordered-item">${this.parseInlineMarkdown(trimmed.substring(3))}</li>`;
      }
      
      // Pass-through check for generated HTML tags
      if (trimmed.startsWith('<div') || trimmed.startsWith('<table') || trimmed.startsWith('<thead') || 
          trimmed.startsWith('<tbody') || trimmed.startsWith('<tr') || trimmed.startsWith('<th') || 
          trimmed.startsWith('<td') || trimmed.startsWith('</') || trimmed.startsWith('<h3') || 
          trimmed.startsWith('<h4') || trimmed.startsWith('<hr')) {
        return line;
      }
      
      return trimmed ? `<p class="analysis-paragraph">${this.parseInlineMarkdown(trimmed)}</p>` : '';
    });

    return processedLines.join('');
  }

  private parseInlineMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>\$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>\$1</em>');
  }
}
