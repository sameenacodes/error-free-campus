import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('efc_token')
    const stored = localStorage.getItem('efc_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('efc_token')
        localStorage.removeItem('efc_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    const { token, user: userData } = res.data
    localStorage.setItem('efc_token', token)
    localStorage.setItem('efc_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('efc_token')
    localStorage.removeItem('efc_user')
    setUser(null)
  }

  const updateUser = (updated) => {
    const merged = { ...user, ...updated }
    localStorage.setItem('efc_user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
