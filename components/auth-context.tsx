"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/services/api"
import { initTTS } from "@/lib/tts"

type Role = "CLINIC" | "ADMIN" | null

interface User {
    id: number
    username: string
    role: string
    first_name?: string
    last_name?: string
}

interface AuthContextType {
    role: Role
    user: User | null
    login: (token: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        initTTS()
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            // Set default header
            api.defaults.headers.common["Authorization"] = `Token ${token}`
            const res = await api.get("/users/users/me/")
            setUser(res.data)

            // Mapping backend roles
            if (res.data.role === "ADMIN") {
                setRole("ADMIN")
            } else {
                // DOCTOR, RECEPTIONIST, etc are part of the CLINIC module
                setRole("CLINIC")
            }
        } catch (e) {
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (token: string) => {
        localStorage.setItem("token", token)
        await checkAuth()
    }

    const logout = () => {
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
        setUser(null)
        setRole(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ role, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
