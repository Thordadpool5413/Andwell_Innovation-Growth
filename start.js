process.env.NODE_ENV = "production"
const port = process.env.PORT || 3000
const { spawn } = require("child_process")
const path = require("path")
const nextBin = path.resolve(__dirname, "node_modules", "next", "dist", "bin", "next")
const server = spawn(process.execPath, [nextBin, "start", "--port", String(port)], {
  stdio: "inherit",
  env: process.env,
})
process.on("SIGTERM", () => server.kill("SIGTERM"))
process.on("SIGINT", () => server.kill("SIGINT"))
server.on("exit", (code) => process.exit(code))
