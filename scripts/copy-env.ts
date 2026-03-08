import fs from 'node:fs'
import path from 'node:path'

const appsDir = 'apps'

if (fs.existsSync(appsDir)) {
  const apps = fs.readdirSync(appsDir)

  for (const app of apps) {
    const appPath = path.join(appsDir, app)
    if (!fs.statSync(appPath).isDirectory()) continue

    const examplePath = path.join(appPath, '.env.example')
    const envPath = path.join(appPath, '.env')

    if (fs.existsSync(examplePath)) {
      const shouldCopy =
        !fs.existsSync(envPath) || fs.statSync(envPath).size === 0

      if (shouldCopy) {
        const contents = fs.readFileSync(examplePath, 'utf8')
        fs.writeFileSync(envPath, contents)
        console.log(`Copied ${examplePath} → ${envPath}`)
      }
    }
  }
}
