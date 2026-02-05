import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const LangContext = createContext(null)

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState('kk')
  const [customerId, setCustomerId] = useState(null)

  // Function to get current customer ID from localStorage
  const getCurrentCustomerId = () => {
    try {
      const customerData = localStorage.getItem('qaraa_customer')
      if (customerData) {
        const customer = JSON.parse(customerData)
        return customer.id
      }
    } catch (_) { }
    return null
  }

  // Function to load language for specific customer
  const loadLanguageForCustomer = (userId) => {
    if (!userId) {
      setLangState('kk')
      return
    }

    try {
      const langKey = `qaraa_lang_${userId}`
      const saved = localStorage.getItem(langKey)
      if (saved && (saved in translations)) {
        setLangState(saved)
      } else {
        setLangState('kk')
      }
    } catch (_) {
      setLangState('kk')
    }
  }

  // Initial load - get customer ID and load their language
  useEffect(() => {
    const userId = getCurrentCustomerId()
    setCustomerId(userId)
    loadLanguageForCustomer(userId)
  }, [])

  // Monitor for customer changes using interval
  useEffect(() => {
    const checkCustomerChange = () => {
      const currentUserId = getCurrentCustomerId()

      // If customer changed, update state and reload language
      if (currentUserId !== customerId) {
        setCustomerId(currentUserId)
        loadLanguageForCustomer(currentUserId)
      }
    }

    // Check every 500ms for customer changes
    const interval = setInterval(checkCustomerChange, 500)

    return () => clearInterval(interval)
  }, [customerId])

  const setLang = (code) => {
    if (!translations[code]) return
    setLangState(code)

    // Save language preference for the specific customer
    const currentUserId = getCurrentCustomerId()
    if (currentUserId) {
      try {
        const langKey = `qaraa_lang_${currentUserId}`
        localStorage.setItem(langKey, code)
      } catch (_) { }
    }
  }

  const t = useMemo(() => {
    const dict = translations[lang] || translations.kk
    return (key) => {
      const parts = key.split('.')
      let cur = dict
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p]
        } else {
          return key
        }
      }
      return typeof cur === 'string' ? cur : key
    }
  }, [lang])

  const value = { lang, setLang, t }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
