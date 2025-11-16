import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading fallback component for lazy-loaded routes
 */
export function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
