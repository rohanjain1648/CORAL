import Shell from '@/components/layout/Shell'
import ChatInterface from '@/components/chat/ChatInterface'

export const metadata = { title: 'NEXUS — Command Center' }

export default function ChatPage() {
  return (
    <Shell>
      <ChatInterface />
    </Shell>
  )
}
