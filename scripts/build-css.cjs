const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..', 'src')
const distDir = path.join(__dirname, '..', 'dist')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function build() {
  ensureDir(distDir)
  const files = ['index.css', 'App.css']
  let merged = ''
  for (const f of files) {
    const filePath = path.join(srcDir, f)
    if (fs.existsSync(filePath)) {
      merged += `\n/* ${f} */\n` + fs.readFileSync(filePath, 'utf8')
    }
  }
  fs.writeFileSync(path.join(distDir, 'main.css'), merged, 'utf8')
  console.log('CSS built -> dist/main.css')
}

if (process.argv.includes('--watch')) {
  build()
  fs.watch(srcDir, { recursive: true }, (evt, filename) => {
    if (!filename) return
    if (!filename.endsWith('.css')) return
    try { build() } catch {}
  })
} else {
  build()
}
