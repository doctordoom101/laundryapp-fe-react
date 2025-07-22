import { createContext, useContext, useState } from "react"
import { twMerge } from "tailwind-merge"

const SidebarContext = createContext()

export function Sidebar({ children, className }) {
    return (
        <aside className={twMerge("flex flex-col h-screen w-64 bg-gray-100 border-r", className)}>
        {children}
        </aside>
    )
}
  

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(true)
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex h-screen w-full">
        {open && <Sidebar>{children[0]}</Sidebar>}
        <div className="flex flex-col w-full">{children[1]}</div>
      </div>
    </SidebarContext.Provider>
  )
}

export function SidebarTrigger({ className }) {
  const { open, setOpen } = useSidebar()
  return (
    <button
      onClick={() => setOpen(!open)}
      className={twMerge("text-sm px-2 py-1 border rounded", className)}
    >
      {open ? "Hide" : "Show"} Menu
    </button>
  )
}

export function SidebarInset({ children }) {
  return <div className="flex flex-col w-full">{children}</div>
}

export function SidebarHeader({ children, className }) {
  return <div className={twMerge("font-bold text-lg mb-4", className)}>{children}</div>
}

export function SidebarContent({ children, className }) {
    return (
      <div className={twMerge("flex-1 overflow-y-auto px-4", className)}>
        {children}
      </div>
    )
  }  

export function SidebarFooter({ children, className }) {
  return <div className={twMerge("mt-auto pt-4 border-t", className)}>{children}</div>
}

export function SidebarGroup({ children, className }) {
  return <div className={twMerge("mb-4", className)}>{children}</div>
}

export function SidebarGroupLabel({ children, className }) {
  return <div className={twMerge("text-sm font-semibold text-gray-500 mb-2", className)}>{children}</div>
}

export function SidebarGroupContent({ children, className }) {
  return <div className={twMerge("flex flex-col gap-1", className)}>{children}</div>
}

export function SidebarMenu({ children, className }) {
  return <nav className={twMerge("flex flex-col gap-1", className)}>{children}</nav>
}

export function SidebarMenuItem({ children, className, href = "#" }) {
  return (
    <a
      href={href}
      className={twMerge("px-3 py-2 rounded hover:bg-gray-200", className)}
    >
      {children}
    </a>
  )
}

export function SidebarMenuButton({ children, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={twMerge("text-left px-3 py-2 rounded hover:bg-gray-200", className)}
    >
      {children}
    </button>
  )
}

export function SidebarSeparator({ className }) {
  return <hr className={twMerge("my-3 border-t border-gray-300", className)} />
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}
