import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
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
    let startX = 0
    let startY = 0
    let isSwiping = false

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      isSwiping = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = Math.abs(e.touches[0].clientX - startX)
      const deltaY = Math.abs(e.touches[0].clientY - startY)
      if (deltaX > 5 || deltaY > 5) {
        isSwiping = true
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      startX = e.clientX
      startY = e.clientY
      isSwiping = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - startX)
      const deltaY = Math.abs(e.clientY - startY)
      if (deltaX > 5 || deltaY > 5) {
        isSwiping = true
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (isSwiping) return

      const target = e.target as HTMLElement
      const toastEl = target.closest('.toast')
      if (toastEl) {
        if (target.closest('button') && !target.closest('[data-close-button]')) {
          return
        }
        const closeBtn = toastEl.querySelector('[data-close-button]') as HTMLButtonElement
        if (closeBtn) {
          closeBtn.click()
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('mousedown', handleMouseDown, { passive: true })
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <Sonner
      closeButton={true}
      swipeDirections={['left', 'right']}
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
          title: 'group-[.toast]:!text-zinc-950',
          content: 'group-[.toast]:!text-zinc-950',
          description: 'group-[.toast]:!text-zinc-500',
          actionButton: 'group-[.toast]:!bg-zinc-900 group-[.toast]:!text-white',
          cancelButton: 'group-[.toast]:!bg-zinc-100 group-[.toast]:!text-zinc-500',
          closeButton: 'hidden opacity-0 pointer-events-none',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
