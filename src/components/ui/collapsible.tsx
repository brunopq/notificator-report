"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
  JSX,
} from "react"
import { ChevronDown } from "lucide-react"
import { twMerge } from "tailwind-merge"

const CollapsibleContext = createContext<{
  open: boolean
  toggle: () => void
} | null>(null)

export function Collapsible({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <CollapsibleContext.Provider value={{ open, toggle: () => setOpen(!open) }}>
      {children}
    </CollapsibleContext.Provider>
  )
}

export function CollapsibleTrigger({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(CollapsibleContext)
  if (!ctx)
    throw new Error("CollapsibleTrigger must be used within Collapsible")

  return (
    <button
      onClick={ctx.toggle}
      className={twMerge("w-full", className)}
      {...props}
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        <ChevronDown
          className={`text-zinc-300 transition-transform ${
            ctx.open ? "rotate-180" : "rotate-0"
          }`}
          size={16}
        />
        {children}
      </div>
    </button>
  )
}

export function CollapsibleContent({
  children,
}: { children: (open: boolean) => JSX.Element }) {
  const ctx = useContext(CollapsibleContext)
  if (!ctx)
    throw new Error("CollapsibleContent must be used within Collapsible")

  return children(ctx.open)
}
