"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock } from "lucide-react"
import { formatTime } from "@/utils/frontend/format-time"

export function SessionTimer({ expiry }: { expiry: number }) {
    const [timeLeft, setTimeLeft] = useState<string>("...")
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            const diff = expiry - now

            if (diff <= 0) {
                clearInterval(interval)
                setTimeLeft("Expired")
                router.push("/login")
                router.refresh()
                return
            }

            setTimeLeft(formatTime(diff))
        }, 1000)

        return () => clearInterval(interval)
    }, [expiry, router])

    if (!expiry) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums cursor-help">
                        <Clock className="h-4 w-4" />
                        <span>{timeLeft}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Session Time Remaining</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
