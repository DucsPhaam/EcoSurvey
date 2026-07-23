import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import FAQChatWidget from '../features/FAQChatWidget'

export default function AdminLayout() {

  return (
    <div className="min-h-screen bg-earth-paper flex flex-col">
      <Navbar />
      <div className="flex flex-1">

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <FAQChatWidget />
    </div>
  )
}
