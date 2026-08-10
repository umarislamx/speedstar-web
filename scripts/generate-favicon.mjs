import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

function resolveSharp() {
  try {
    return require("sharp")
  } catch {
    return require(path.join(root, "node_modules/next/node_modules/sharp"))
  }
}

async function resolveToIco() {
  try {
    return (await import("to-ico")).default
  } catch {
    execSync("npm install --no-save to-ico", {
      cwd: root,
      stdio: "inherit",
    })
    return (await import("to-ico")).default
  }
}

const sharp = resolveSharp()
const toIco = await resolveToIco()

const svgPath = path.join(root, "app/icon.svg")
const png16 = await sharp(svgPath).resize(16, 16).png().toBuffer()
const png32 = await sharp(svgPath).resize(32, 32).png().toBuffer()
const png48 = await sharp(svgPath).resize(48, 48).png().toBuffer()
const apple = await sharp(svgPath).resize(180, 180).png().toBuffer()

const ico = await toIco([png16, png32, png48])

fs.writeFileSync(path.join(root, "app/favicon.ico"), ico)
fs.writeFileSync(path.join(root, "app/apple-icon.png"), apple)
fs.mkdirSync(path.join(root, "public/icons"), { recursive: true })
fs.writeFileSync(path.join(root, "public/icons/apple-touch-icon.png"), apple)

console.log(
  JSON.stringify(
    {
      faviconIcoBytes: ico.length,
      appleIconBytes: apple.length,
      iconSvg: "app/icon.svg",
    },
    null,
    2
  )
)
