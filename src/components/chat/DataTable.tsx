'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import type { DataRow } from '@/types'

interface DataTableProps {
  rows: DataRow[]
  maxRows?: number
}

export default function DataTable({ rows, maxRows = 6 }: DataTableProps) {
  const [expanded, setExpanded] = useState(false)

  if (!rows.length) return null

  const columns = Object.keys(rows[0])
  const visible = expanded ? rows : rows.slice(0, maxRows)
  const hasMore = rows.length > maxRows

  const downloadCSV = () => {
    const header = columns.join(',')
    const body = rows.map(r => columns.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'nexus-result.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="mt-3 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.25)' }}
    >
      {/* Table */}
      <div style={{ maxHeight: expanded ? 400 : 240, overflowY: 'auto', overflowX: 'auto' }}>
        <table className="nx-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col} title={String(row[col] ?? '')}>
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          borderTop: '1px solid var(--nx-border)',
          background: 'rgba(13,13,23,0.4)',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--nx-muted)' }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''}
          {!expanded && hasMore ? ` · showing ${maxRows}` : ''}
        </span>
        <div className="flex items-center gap-2">
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 transition-colors"
              style={{ fontSize: 11, color: 'var(--nx-indigo-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Collapse' : `Show all ${rows.length}`}
            </button>
          )}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: 11, color: 'var(--nx-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Download CSV"
          >
            <Download size={11} />
            CSV
          </button>
        </div>
      </div>
    </div>
  )
}

function renderCell(val: DataRow[string]): React.ReactNode {
  if (val === null || val === undefined) {
    return <span style={{ color: 'var(--nx-muted)', fontStyle: 'italic' }}>null</span>
  }
  if (typeof val === 'boolean') {
    return (
      <span style={{ color: val ? 'var(--nx-success)' : 'var(--nx-error)' }}>
        {val ? 'true' : 'false'}
      </span>
    )
  }
  const str = String(val)
  // Detect URLs
  if (str.startsWith('http')) {
    return (
      <a
        href={str}
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--nx-indigo-light)', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
      >
        {str.length > 40 ? str.slice(0, 40) + '…' : str}
      </a>
    )
  }
  return str
}
