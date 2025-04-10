
import { useState } from 'react'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { Message } from './types/chat'
import { useToast } from './hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'

function App() {
  // Load messages from localStorage on initial render
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat-messages')
    return saved ? JSON.parse(saved) : []
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Save messages to localStorage whenever they change
  const saveMessages = (newMessages: Message[]) => {
    localStorage.setItem('chat-messages', JSON.stringify(newMessages))
    setMessages(newMessages)
  }

  const handleSend = async (content: string) => {
    if (isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    }

    // Add user message
    saveMessages([...messages, userMessage])
    setIsLoading(true)

    try {
      // Simulate AI response with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I received your message: "${content}". This is a demo response that simulates an AI chat. In a real app, this would connect to an AI service.`,
      }

      // Add AI message
      saveMessages([...messages, userMessage, aiMessage])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process message. Please try again.",
      })
      // Remove the user message if AI fails to respond
      saveMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    localStorage.removeItem('chat-messages')
    setMessages([])
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <h1 className="text-xl font-semibold">Local Chat Demo</h1>
        <button 
          onClick={clearChat}
          className="px-3 py-1 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Clear Chat
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto py-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground">
                Start a conversation by sending a message below.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t p-4">
        <div className="container max-w-4xl mx-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  )
}

export default App