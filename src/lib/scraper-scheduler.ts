import { store } from "./store"
import { ScheduledJob } from "./types"

let cronInterval: ReturnType<typeof setInterval> | null = null

const JOBS: ScheduledJob[] = [
  {
    id: "cms-weekly",
    name: "CMS Star Ratings Sync",
    cron: "0 8 * * 1",
    handler: "cms",
    enabled: true,
    lastRun: undefined,
  },
  {
    id: "dhhs-weekly",
    name: "Maine DHHS Filing Check",
    cron: "0 9 * * 1,4",
    handler: "dhhs",
    enabled: true,
    lastRun: undefined,
  },
]

function getNextRun(cron: string): string {
  const parts = cron.split(" ")
  if (parts.length !== 5) return "unknown"
  const [minute, hour, , , dayOfWeek] = parts
  const now = new Date()
  const next = new Date(now)
  next.setMinutes(parseInt(minute) || 0)
  next.setSeconds(0)
  next.setMilliseconds(0)
  if (dayOfWeek !== "*") {
    const targetDay = parseInt(dayOfWeek)
    const currentDay = next.getDay()
    let diff = targetDay - currentDay
    if (diff <= 0) diff += 7
    next.setDate(next.getDate() + diff)
  }
  next.setHours(parseInt(hour) || 0)
  if (next <= now) next.setDate(next.getDate() + 7)
  return next.toISOString()
}

function matchCron(cron: string): boolean {
  const parts = cron.split(" ")
  if (parts.length !== 5) return false
  const now = new Date()
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  if (minute !== "*" && parseInt(minute) !== now.getMinutes()) return false
  if (hour !== "*" && parseInt(hour) !== now.getHours()) return false
  if (dayOfWeek !== "*" && parseInt(dayOfWeek) !== now.getDay()) return false
  if (dayOfMonth !== "*" && parseInt(dayOfMonth) !== now.getDate()) return false
  if (month !== "*" && parseInt(month) !== now.getMonth() + 1) return false
  return true
}

export const scheduler = {
  async start() {
    if (cronInterval) return

    JOBS.forEach(j => {
      j.lastRun = store.getReports().find(r => r.id === `sched-${j.id}`)?.createdAt
    })

    cronInterval = setInterval(async () => {
      for (const job of JOBS) {
        if (!job.enabled) continue

        if (job.lastRun && new Date(job.lastRun).toDateString() === new Date().toDateString()) continue

        if (matchCron(job.cron)) {
          try {
            if (job.handler === "cms") {
              const { cmsScraper } = await import("./scrapers/cms")
              await cmsScraper.scrape()
            } else if (job.handler === "dhhs") {
              const { dhhsScraper } = await import("./scrapers/dhhs")
              await dhhsScraper.scrape()
            }
            job.lastRun = new Date().toISOString()
            const reports = store.getReports()
            reports.push({
              id: `sched-${job.id}-${Date.now()}`,
              title: `Scheduled: ${job.name}`,
              type: "competitive",
              createdAt: new Date().toISOString().split("T")[0],
              summary: `Auto-scrape completed for ${job.name}`,
            })
            store.saveReports(reports)
          } catch (err) {
            console.error(`Scheduler error for ${job.id}:`, err)
          }
        }
      }
    }, 60000)

    return JOBS
  },

  stop() {
    if (cronInterval) {
      clearInterval(cronInterval)
      cronInterval = null
    }
  },

  getJobs(): ScheduledJob[] {
    return JOBS.map(j => ({
      ...j,
      lastRun: j.lastRun,
      nextRun: getNextRun(j.cron),
    }))
  },

  async runNow(jobId: string) {
    const job = JOBS.find(j => j.id === jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)
    job.lastRun = new Date().toISOString()
    if (job.handler === "cms") {
      const { cmsScraper } = await import("./scrapers/cms")
      return cmsScraper.scrape()
    } else if (job.handler === "dhhs") {
      const { dhhsScraper } = await import("./scrapers/dhhs")
      return dhhsScraper.scrape()
    }
  },
}
