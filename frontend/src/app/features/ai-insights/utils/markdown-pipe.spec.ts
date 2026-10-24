import { MarkdownPipe } from './markdown-pipe';

describe('MarkdownPipe Testing Suite', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    pipe = new MarkdownPipe();
  });

  it('should return an empty string if value parameter evaluates as falsy or blank', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as any)).toBe('');
  });

  it('should parse headings and structural thematic break rules accurately', () => {
    const headingInput = '## Allocation Changes\n### High Risk Signals\n---';
    const output = pipe.transform(headingInput);

    expect(output).toContain('<h3 class="analysis-subheading">Allocation Changes</h3>');
    expect(output).toContain('<h4 class="analysis-heading">High Risk Signals</h4>');
    expect(output).toContain('<hr class="analysis-divider" />');
  });

  it('should parse inline style structures like bold and italics across text segments', () => {
    const textInput = 'Reviewing **Crypto asset holdings** with *Gemini optimizations*.';
    const output = pipe.transform(textInput);

    expect(output).toContain('<strong>Crypto asset holdings</strong>');
    expect(output).toContain('<em>Gemini optimizations</em>');
    expect(output).toContain('<p class="analysis-paragraph">');
  });

  it('should convert markdown lists into structural items', () => {
    const listInput = '* Unordered Item Context\n1. First Ordered Choice';
    const output = pipe.transform(listInput);

    expect(output).toContain('<li class="analysis-list-item">Unordered Item Context</li>');
    expect(output).toContain('<li class="analysis-ordered-item">First Ordered Choice</li>');
  });

  it('should cleanly parse complete markdown tables while ignoring separator lines', () => {
    const tableInput = 
      '| Asset | Allocation |\n' +
      '| --- | --- |\n' +
      '| BTC | 60% |\n' +
      '| ETH | 40% |\n' +
      'Final Summary Paragraph.';

    const output = pipe.transform(tableInput);

    expect(output).toContain('<div class="table-responsive"><table class="dashboard-data-table">');
    expect(output).toContain('<thead><tr><th>Asset</th><th>Allocation</th></tr></thead>');
    expect(output).toContain('<tbody><tr><td>BTC</td><td>60%</td></tr><tr><td>ETH</td><td>40%</td></tr></tbody></table></div>');
    expect(output).toContain('<p class="analysis-paragraph">Final Summary Paragraph.</p>');
  });

  it('should bypass wrapping block level elements with paragraph tags', () => {
    const htmlInput = '<div class="custom-card">Plain Data Mapping</div>';
    const output = pipe.transform(htmlInput);

    expect(output).toBe('<div class="custom-card">Plain Data Mapping</div>');
    expect(output).not.toContain('class="analysis-paragraph"');
  });

  it('should return an empty string array slice if an empty line spacing break is passed mid-stream', () => {
    const inputWithBlankLines = 'First Paragraph\n\nSecond Paragraph';
    const output = pipe.transform(inputWithBlankLines);

    expect(output).toContain('<p class="analysis-paragraph">First Paragraph</p>');
    expect(output).toContain('<p class="analysis-paragraph">Second Paragraph</p>');
    expect(output).toBe('<p class="analysis-paragraph">First Paragraph</p><p class="analysis-paragraph">Second Paragraph</p>');
  });
});
