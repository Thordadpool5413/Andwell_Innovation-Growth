import * as XLSX from 'xlsx';

export function downloadXlsx(
  filename: string,
  sheets: { name: string; headers: string[]; rows: (string | number | boolean | null | undefined)[][] }[]
) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    // Bold header row
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true } };
    }
    ws['!cols'] = sheet.headers.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(wb, filename);
}
