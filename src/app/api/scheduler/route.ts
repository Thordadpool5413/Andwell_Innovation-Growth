import { NextRequest, NextResponse } from "next/server"
import { scheduler } from "@/lib/scraper-scheduler"

export async function GET() {
  const jobs = scheduler.getJobs()
  return NextResponse.json({ jobs })
}

export async function POST(req: NextRequest) {
  try {
    const { action, jobId } = await req.json()

    if (action === "start") {
      const jobs = await scheduler.start()
      return NextResponse.json({ message: "Scheduler started", jobs })
    }

    if (action === "stop") {
      scheduler.stop()
      return NextResponse.json({ message: "Scheduler stopped" })
    }

    if (action === "run" && jobId) {
      const findings = await scheduler.runNow(jobId)
      return NextResponse.json({ message: `Job ${jobId} executed`, findings: findings?.length || 0 })
    }

    return NextResponse.json({ error: "Invalid action. Use start, stop, or run." }, { status: 400 })
  } catch (err) {
    console.error("Scheduler API error:", err)
    return NextResponse.json({ error: "Scheduler operation failed" }, { status: 500 })
  }
}
