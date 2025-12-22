import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Home, FileText, MessageSquare } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Mobile navigation drawer component
 * 
 * Displays as a hamburger menu button that opens a side drawer with navigation links.
 * Only visible on mobile/tablet devices (< 1024px).
 */
export function MobileNav() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    {
      to: '/projects',
      icon: Home,
      label: t('navigation.home'),
    },
    {
      to: '/documents',
      icon: FileText,
      label: t('navigation.documents'),
      disabled: true, // Requires project context
    },
    {
      to: '/chat',
      icon: MessageSquare,
      label: t('navigation.chat'),
      disabled: true, // Requires project context
    },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t('navigation.menu')}
          data-testid="mobile-menu-trigger"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>{t('navigation.menu')}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.to)
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
                  item.disabled && 'opacity-50 pointer-events-none'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={item.disabled}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
