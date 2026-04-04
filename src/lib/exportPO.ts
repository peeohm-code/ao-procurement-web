// ==========================================
// AO Procurement — PO Export Utilities
// CSV, Excel (.xlsx), PDF (print window)
// ==========================================

import { TempQuotation, POItem, STATUS_LABELS, PAYMENT_LABELS } from './types'

// ─── Shared helpers ────────────────────────────────────────────

const HEADERS = ['เลขที่ PO', 'โครงการ', 'ร้านค้า', 'เลขเอกสาร', 'ยอดเงิน (บาท)', 'วิธีจ่าย', 'สถานะ', 'วันที่สร้าง']

function poToRow(po: TempQuotation): (string | number)[] {
  return [
    po.id,
    po.project_id,
    po.shop_name || '',
    po.doc_number || '',
    Number(po.grand_total),
    PAYMENT_LABELS[po.payment_method] || po.payment_method || '',
    STATUS_LABELS[po.status] || po.status,
    new Date(po.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
  ]
}

function formatBaht(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── CSV Export ────────────────────────────────────────────────

export function exportCSV(pos: TempQuotation[]): void {
  const rows = pos.map(po => poToRow(po).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [HEADERS.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `PO-export-${today()}.csv`)
}

// ─── Excel Export ──────────────────────────────────────────────

export async function exportExcel(pos: TempQuotation[]): Promise<void> {
  const ExcelJS = (await import('exceljs')).default

  const wb = new ExcelJS.Workbook()
  wb.creator = 'AO Procurement'
  wb.created = new Date()

  // ── Sheet 1: PO Summary ──────────────────────────────────────
  const ws = wb.addWorksheet('ทะเบียน PO')

  // Title row
  ws.mergeCells('A1:H1')
  const titleCell = ws.getCell('A1')
  titleCell.value = `รายการ PO ทั้งหมด — ส่งออกวันที่ ${new Date().toLocaleDateString('th-TH')}`
  titleCell.font = { bold: true, size: 13, color: { argb: 'FF00366D' } }
  titleCell.alignment = { horizontal: 'center' }

  ws.addRow([]) // spacer

  // Header row
  const headerRow = ws.addRow(HEADERS)
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00366D' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF00CE81' } },
    }
  })

  // Data rows
  pos.forEach((po, idx) => {
    const row = poToRow(po)
    const dataRow = ws.addRow(row)
    const isEven = idx % 2 === 0
    dataRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF8FFFE' : 'FFFFFFFF' } }
    })
    // Amount column (col 5) — right-align + number format
    const amtCell = dataRow.getCell(5)
    amtCell.numFmt = '#,##0.00'
    amtCell.alignment = { horizontal: 'right' }
    // Status color
    const status = po.status
    const statusCell = dataRow.getCell(7)
    if (status === 'paid') statusCell.font = { color: { argb: 'FF10B981' }, bold: true }
    else if (status === 'cancelled') statusCell.font = { color: { argb: 'FFEF4444' } }
    else if (status === 'approved') statusCell.font = { color: { argb: 'FF00CE81' } }
    else if (['awaiting_transfer', 'awaiting_receipt'].includes(status)) {
      statusCell.font = { color: { argb: 'FFF59E0B' } }
    }
  })

  // Total row
  const total = pos.reduce((s, po) => s + Number(po.grand_total), 0)
  ws.addRow([])
  const totalRow = ws.addRow(['', '', '', 'รวมทั้งหมด', total, '', `${pos.length} รายการ`, ''])
  totalRow.getCell(4).font = { bold: true }
  totalRow.getCell(5).font = { bold: true, color: { argb: 'FF00366D' } }
  totalRow.getCell(5).numFmt = '#,##0.00'
  totalRow.getCell(5).alignment = { horizontal: 'right' }
  totalRow.getCell(7).font = { color: { argb: 'FF6B7280' }, italic: true }

  // Column widths
  ws.columns = [
    { width: 22 }, // PO ID
    { width: 10 }, // Project
    { width: 28 }, // Shop
    { width: 16 }, // Doc number
    { width: 16 }, // Amount
    { width: 14 }, // Payment
    { width: 16 }, // Status
    { width: 14 }, // Date
  ]
  ws.getRow(3).height = 24

  // ── Sheet 2: PO Detail (items) ──────────────────────────────
  const ws2 = wb.addWorksheet('รายละเอียดรายการ')

  ws2.mergeCells('A1:I1')
  const t2 = ws2.getCell('A1')
  t2.value = 'รายละเอียดสินค้าในแต่ละ PO'
  t2.font = { bold: true, size: 13, color: { argb: 'FF00366D' } }
  t2.alignment = { horizontal: 'center' }
  ws2.addRow([])

  const detailHeaders = ['เลขที่ PO', 'โครงการ', 'ร้านค้า', 'รายการสินค้า', 'Cost Code', 'จำนวน', 'หน่วย', 'ราคา/หน่วย', 'ยอด']
  const dh = ws2.addRow(detailHeaders)
  dh.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00366D' } }
    cell.alignment = { horizontal: 'center' }
  })

  pos.forEach(po => {
    const items: POItem[] = Array.isArray(po.items) ? po.items : []
    if (items.length === 0) return
    items.forEach((item, i) => {
      const itemRow = ws2.addRow([
        i === 0 ? po.id : '',
        i === 0 ? po.project_id : '',
        i === 0 ? (po.shop_name || '') : '',
        item.name,
        item.cost_code,
        item.qty,
        item.unit,
        item.unit_price,
        item.amount,
      ])
      itemRow.getCell(8).numFmt = '#,##0.00'
      itemRow.getCell(9).numFmt = '#,##0.00'
      itemRow.getCell(9).font = { bold: true }
    })
  })

  ws2.columns = [
    { width: 22 }, { width: 10 }, { width: 24 }, { width: 36 },
    { width: 12 }, { width: 10 }, { width: 10 }, { width: 14 }, { width: 14 },
  ]
  ws2.getRow(3).height = 24

  // Download
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  downloadBlob(blob, `PO-export-${today()}.xlsx`)
}

// ─── PDF Export (print window) ─────────────────────────────────

export function exportPDF(pos: TempQuotation[]): void {
  const total = pos.reduce((s, po) => s + Number(po.grand_total), 0)
  const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  const rows = pos.map((po, idx) => {
    const statusLabel = STATUS_LABELS[po.status] || po.status
    const statusColor = getStatusColor(po.status)
    return `
      <tr style="background:${idx % 2 === 0 ? '#f8fffe' : '#fff'}">
        <td style="font-family:monospace;font-size:11px;color:#00366D;font-weight:600">${po.id}</td>
        <td>${po.project_id}</td>
        <td style="max-width:180px;overflow:hidden">${po.shop_name || '—'}</td>
        <td>${po.doc_number || '—'}</td>
        <td style="text-align:right;font-weight:600">${formatBaht(Number(po.grand_total))}</td>
        <td style="text-align:center">${PAYMENT_LABELS[po.payment_method] || '—'}</td>
        <td style="text-align:center">
          <span style="background:${statusColor.bg};color:${statusColor.text};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">
            ${statusLabel}
          </span>
        </td>
        <td style="text-align:center;color:#9CA3AF;font-size:11px">
          ${new Date(po.created_at).toLocaleDateString('th-TH')}
        </td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ทะเบียน PO — AO Procurement</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans Thai', 'Inter', sans-serif; color: #111827; font-size: 13px; padding: 32px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #00CE81; }
    .logo { font-size: 18px; font-weight: 700; color: #00366D; }
    .logo span { color: #00CE81; }
    .meta { text-align: right; color: #6B7280; font-size: 12px; line-height: 1.6; }
    h1 { font-size: 16px; font-weight: 700; color: #00366D; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { background: #00366D; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
    th:nth-child(5), th:nth-child(7), th:nth-child(8) { text-align: center; }
    td { padding: 7px 10px; border-bottom: 1px solid #F3F4F6; }
    .total-row td { border-top: 2px solid #00CE81; font-weight: 700; background: #F0FDF9; }
    .footer { margin-top: 24px; text-align: center; color: #9CA3AF; font-size: 11px; }
    @media print {
      body { padding: 16px; }
      @page { size: A4 landscape; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">AO <span>Procurement</span></div>
      <h1>รายงานทะเบียน PO</h1>
    </div>
    <div class="meta">
      <div>ส่งออกวันที่ ${dateStr}</div>
      <div>จำนวน ${pos.length} รายการ</div>
      <div style="color:#00366D;font-weight:600">ยอดรวม ${formatBaht(total)} บาท</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>เลขที่ PO</th>
        <th>โครงการ</th>
        <th>ร้านค้า</th>
        <th>เลขเอกสาร</th>
        <th style="text-align:right">ยอดเงิน</th>
        <th style="text-align:center">วิธีจ่าย</th>
        <th style="text-align:center">สถานะ</th>
        <th style="text-align:center">วันที่</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="4" style="text-align:right;color:#6B7280">รวมทั้งหมด</td>
        <td style="text-align:right;color:#00366D">${formatBaht(total)}</td>
        <td></td>
        <td style="text-align:center;color:#6B7280">${pos.length} รายการ</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">AO Construction Procurement System · พิมพ์วันที่ ${dateStr}</div>
  <script>window.onload = () => { window.print() }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

// ─── Internal helpers ──────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function getStatusColor(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    paid:              { bg: '#D1FAE5', text: '#065F46' },
    approved:          { bg: '#D1FAE5', text: '#065F46' },
    awaiting_transfer: { bg: '#FEF3C7', text: '#92400E' },
    awaiting_receipt:  { bg: '#FEF3C7', text: '#92400E' },
    pending_credit:    { bg: '#CFFAFE', text: '#164E63' },
    approved_credit:   { bg: '#CCFBF1', text: '#134E4A' },
    cancelled:         { bg: '#FEE2E2', text: '#991B1B' },
    pending_cc:        { bg: '#FEF9C3', text: '#713F12' },
  }
  return map[status] || { bg: '#F3F4F6', text: '#374151' }
}
