import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ShopProvider } from './pages/shop/ShopContext.jsx' // Context Provider එක Import කරා

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* මුළු ඇප් එකටම ඇනිමේෂන් ස්ටේට් එක ලැබෙන්න Provider එක මෙතනින් Wrap කරා */}
    <ShopProvider>
      <App />
    </ShopProvider>
  </StrictMode>,
)