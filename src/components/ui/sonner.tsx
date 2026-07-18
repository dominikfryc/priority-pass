import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps, toast } from 'sonner'
import { useEffect } from 'react'
import {
  MdAutorenew,
  MdOutlineErrorOutline,
  MdCheck,
  MdInfoOutline,
  MdWarningAmber,
} from 'react-icons/md'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  useEffect(() => {
    const handleToastClick = (e: MouseEvent) => {
      // Find closest toast element and ensure it's not a button (like an action/cancel button)
      const target = e.target as HTMLElement
      if (target.closest('.toast') && !target.closest('button')) {
        toast.dismiss()
      }
    }
    document.addEventListener('click', handleToastClick)
    return () => document.removeEventListener('click', handleToastClick)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <MdCheck className="size-5" />,
        info: <MdInfoOutline className="size-5" />,
        warning: <MdWarningAmber className="size-5" />,
        error: <MdOutlineErrorOutline className="size-5" />,
        loading: <MdAutorenew className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group leading-none toast group-[.toaster]:!bg-white/90 group-[.toaster]:!backdrop-blur-md group-[.toaster]:!text-zinc-950 group-[.toaster]:!border-none group-[.toaster]:!rounded-full group-[.toaster]:!shadow-lg group-[.toaster]:!py-4 group-[.toaster]:!px-6',
          error:
            'group-[.toaster]:!bg-white/90 group-[.toaster]:!text-zinc-950 group-[.toaster]:!border-none group-[.toaster]:!rounded-full group-[.toaster]:!py-4 group-[.toaster]:!px-6',
          success:
            'group-[.toaster]:!bg-white/90 group-[.toaster]:!text-zinc-950 group-[.toaster]:!border-none group-[.toaster]:!rounded-full group-[.toaster]:!py-4 group-[.toaster]:!px-6',
          warning:
            'group-[.toaster]:!bg-white/90 group-[.toaster]:!text-zinc-950 group-[.toaster]:!border-none group-[.toaster]:!rounded-full group-[.toaster]:!py-4 group-[.toaster]:!px-6',
          info: 'group-[.toaster]:!bg-white/90 group-[.toaster]:!text-zinc-950 group-[.toaster]:!border-none group-[.toaster]:!rounded-full group-[.toaster]:!py-4 group-[.toaster]:!px-6',
          description: 'group-[.toast]:!text-zinc-500',
          actionButton: 'group-[.toast]:!bg-zinc-900 group-[.toast]:!text-white',
          cancelButton: 'group-[.toast]:!bg-zinc-100 group-[.toast]:!text-zinc-500',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
