import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import FAQChatWidget from '../features/FAQChatWidget'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-earth-paper flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <FAQChatWidget />
    </div>
  )
}
