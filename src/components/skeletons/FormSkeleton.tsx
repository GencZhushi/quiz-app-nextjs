import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

// Skeleton for form buttons (login/register)
export function FormButtonSkeleton() {
  return (
    <div className="animate-pulse bg-gray-700/50 h-10 w-full rounded-md flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/30 border-t-white/70 rounded-full animate-spin"></div>
    </div>
  )
}

// Skeleton for auth forms (login/register pages)
export function AuthFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      <Card className="w-full max-w-md p-8 bg-gray-800/50 border-gray-700">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Footer */}
          <div className="text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </Card>
    </div>
  )
}
