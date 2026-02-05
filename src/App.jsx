import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import CardInfo from './pages/CardInfo'
import Login from './pages/Login'
import LoginMobile from './pages/LoginMobile'
import Dashboard from './pages/Dashboard'
import DashboardMobile from './pages/DashboardMobile'
import History from './pages/History'
import Profile from './pages/Profile'
import Aboutus from './pages/Aboutus'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Cart from './pages/Cart'
import TrackOrder from './pages/TrackOrder'
import News from './pages/News'
import StoreDashboard from './pages/StoreDashboard'
import CoffeeDashboard from './pages/CoffeeDashboard'
import { LangProvider } from './context/LangContext'
import UserTracker from './components/UserTracker'

function App() {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      // Расширенная проверка: ширина или наличие тача (чтобы точно ловить телефоны)
      setIsMobile(window.innerWidth <= 1024 || navigator.maxTouchPoints > 0)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedCustomer = localStorage.getItem('qaraa_customer')
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer))
      } catch (error) {
        console.error('Error parsing saved customer:', error)
        localStorage.removeItem('qaraa_customer')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (customerData) => {
    setCustomer(customerData)
    localStorage.setItem('qaraa_customer', JSON.stringify(customerData))
  }

  const handleLogout = async () => {
    if (customer?.id) {
      try {
        await supabase
          .from('customers')
          .update({ is_online: false, last_active: new Date().toISOString() })
          .eq('id', customer.id)
      } catch (e) {
        console.error('Logout update error:', e)
      }
    }
    // Only clear session after attempting update
    setCustomer(null)
    localStorage.removeItem('qaraa_customer')

    // Also sign out from Supabase auth if using it
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#FFFFFF',
          letterSpacing: '2px'
        }}>
          qaraa
        </div>
      </div>
    )
  }

  return (
    <LangProvider>
      <Router>
        <UserTracker customer={customer} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={customer ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/card-info" element={customer ? <Navigate to="/dashboard" /> : <CardInfo />} />
          <Route path="/about-us" element={customer ? <Navigate to="/dashboard" /> : <Aboutus />} />
          <Route path="/privacy" element={customer ? <Navigate to="/dashboard" /> : <Privacy />} />
          <Route path="/terms" element={customer ? <Navigate to="/dashboard" /> : <Terms />} />
          <Route
            path="/login"
            element={
              customer ? (
                <Navigate to="/dashboard" />
              ) : (
                isMobile ? <LoginMobile onLogin={handleLogin} /> : <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              customer ? (
                isMobile ? <DashboardMobile /> : <Dashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/history"
            element={
              customer ? <History customer={customer} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/cart"
            element={
              customer ? <Cart customer={customer} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/track"
            element={
              customer ? <TrackOrder /> : <Navigate to="/" />
            }
          />
          <Route
            path="/profile"
            element={
              customer ? <Profile customer={customer} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/news"
            element={
              customer ? <News customer={customer} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/storedashboard"
            element={
              customer ? <StoreDashboard /> : <Navigate to="/" />
            }
          />
          <Route
            path="/coffeedashboard"
            element={
              customer ? <CoffeeDashboard /> : <Navigate to="/" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </LangProvider>
  )
}

export default App
