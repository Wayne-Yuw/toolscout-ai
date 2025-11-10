"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from '@/lib/i18n'

function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ")
}

export default function AvatarUpload({
  value,
  onChange,
  maxSizeMB = 2,
}: {
  value: string | null
  onChange: (val: string | null) => void
  maxSizeMB?: number
}) {
  const t = useTranslations()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const pick = () => inputRef.current?.click()

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      if (!file.type.startsWith("image/")) {
        setError(t('auth.upload.onlyImages'))
        return
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${t('auth.upload.tooLarge')}${maxSizeMB}MB`)
        return
      }
      const dataUrl = await toDataURL(file)
      onChange(dataUrl)
    },
    [maxSizeMB, onChange]
  )

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await handleFile(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed",
          dragging ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:bg-zinc-50"
        )}
        onClick={pick}
      >
        {value ? (
          <img src={value} alt="avatar preview" className="h-full w-full rounded-xl object-cover" />
        ) : (
          <div className="text-center text-sm text-zinc-500">
            {t('auth.upload.hint')}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await handleFile(file)
        }}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

async function toDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
