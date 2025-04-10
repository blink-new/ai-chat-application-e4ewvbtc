
import { useState } from 'react'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { Message } from './types/chat'
import { useToast } from './hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async (content: string) => {
    if (isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
      }

      setMessages(prev => [...prev, aiMessage])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              aiMessage = {
                ...aiMessage,
                content: aiMessage.content + content,
              }
              setMessages(prev => 
                prev.map(m => m.id === aiMessage.id ? aiMessage : m)
              )
            } catch (e) {
              console.error('Failed to parse chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      })
      setMessages(prev => prev.filter(m => m.id !== messages[messages.length - 1]?.id))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <h1 className="text-xl font-semibold">AI Chat</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto">
          <div className="flex flex-col divide-y">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
                Start a conversation by sending a message below.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container max-w-4xl mx-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  )
}

export default App