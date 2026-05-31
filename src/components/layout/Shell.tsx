'use client'

import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--nx-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
