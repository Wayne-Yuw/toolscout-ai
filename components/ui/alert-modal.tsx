"use client"

import { useEffect } from "react"

export default function AlertModal({
  open,
  title = 'Notice',
  okText = 'OK',
  message,
  onClose,
}: {
  open: boolean
  title?: string
  okText?: string
  message: string | React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <div className="mt-3 text-sm text-zinc-600">{message}</div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  )
}
