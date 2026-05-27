export function downloadXlsx(
  filename: string,
  sheets: { name: string; headers: string[]; rows: (string | number | boolean | null | undefined)[][] }[]
) {
  const csvFilename = filename.replace(/\.xlsx$/i, '.csv');
  const escapeCell = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines: string[] = [];
  for (const sheet of sheets) {
    if (lines.length) lines.push('');
    lines.push(`# ${sheet.name}`);
    lines.push(sheet.headers.map(escapeCell).join(','));
    for (const row of sheet.rows) lines.push(row.map(escapeCell).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvFilename;
  link.click();
  URL.revokeObjectURL(url);
}
