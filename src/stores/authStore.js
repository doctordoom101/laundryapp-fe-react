import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"
import api from "../api/axios"

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post("/login", credentials)
          const { user, token } = response.data

          // Store in cookies
          Cookies.set("auth_token", token, { expires: 7 })
          Cookies.set("user", JSON.stringify(user), { expires: 7 })

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await api.post("/logout")
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          // Clear cookies and state
          Cookies.remove("auth_token")
          Cookies.remove("user")
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      initializeAuth: () => {
        const token = Cookies.get("auth_token")
        const userCookie = Cookies.get("user")

        if (token && userCookie) {
          try {
            const user = JSON.parse(userCookie)
            set({
              user,
              token,
              isAuthenticated: true,
            })
          } catch (error) {
            console.error("Error parsing user cookie:", error)
            get().logout()
          }
        }
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      hasAnyRole: (roles) => {
        const { user } = get()
        return roles.includes(user?.role)
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export default useAuthStore
