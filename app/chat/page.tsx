'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Users, MessageSquare } from 'lucide-react'
// import { io } from 'socket.io-client'

interface ChatMessage {
  id: string
  content: string
  user_name: string
  user_email: string
  created_at: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<any>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initSocket = async () => {
      if (status === 'loading') return
      if (!session) {
        router.push('/auth/signin')
        return
      }

    // Initialize Socket.IO connection
    const socketModule = await import('socket.io-client')
    const newSocket = socketModule.default(process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:3001', {
      auth: {
        token: session.user?.email
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('userJoined', (userEmail: string) => {
      setOnlineUsers(prev => [...prev, userEmail])
    })

    newSocket.on('userLeft', (userEmail: string) => {
      setOnlineUsers(prev => prev.filter(email => email !== userEmail))
    })

    newSocket.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users)
    })

    setSocket(newSocket)

    // Load existing messages
    fetchMessages()

    }
    
    initSocket()
    
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [session, status, router, socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          room_id: 'general'
        })
      })

      if (response.ok) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Community Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span>{onlineUsers.length} online</span>
              </div>
              <span className="text-gray-300">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.user_email === session.user?.email ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user_email === session.user?.email
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white'
                }`}>
                  <div className="text-xs text-gray-300 mb-1">
                    {message.user_name || message.user_email}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-md border-l border-white/10 p-4">
          <h3 className="text-lg font-bold text-white mb-4">Online Users</h3>
          <div className="space-y-2">
            {onlineUsers.map((userEmail) => (
              <div key={userEmail} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-sm truncate">
                  {userEmail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}