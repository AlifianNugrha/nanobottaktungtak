import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function IntegrationSkeleton() {
    return (
        <div className="max-w-5xl mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 pb-20 font-jakarta">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-11 w-40" />
            </div>

            <div className="space-y-4">
                <Skeleton className="h-4 w-32 ml-1" />

                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-4 border-border rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-9 h-9 rounded-md" />
                                    <Skeleton className="w-9 h-9 rounded-md" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
