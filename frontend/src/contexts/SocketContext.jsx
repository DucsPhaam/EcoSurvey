import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const { user, accessToken } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    // Get token from auth context or localStorage
    const token = accessToken || localStorage.getItem('ecosurvey_token')
    
    // Fallback to absolute URL if VITE_API_URL is just '/api'
    const serverUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http') 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000'

    const socketInstance = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'], // fallback to polling
    })

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected')
    })

    socketInstance.on('connect_error', (err) => {
      console.error('🔌 Socket connection error:', err.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user, accessToken])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
