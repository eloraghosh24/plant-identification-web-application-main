import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

export function ResultSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center p-4 items-center">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-8 w-48 mt-4" />
        <Skeleton className="h-6 w-32 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 justify-center">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </CardFooter>
    </Card>
  )
}
