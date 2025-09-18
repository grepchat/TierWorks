import { build, context } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const isWatch = process.argv.includes('--watch')
const modeArg = process.argv.find(a => a.startsWith('--mode='))
const mode = modeArg ? modeArg.split('=')[1] : (isWatch ? 'development' : 'development')

const common = {
  entryPoints: [path.join(projectRoot, 'src', 'main.tsx')],
  outfile: path.join(projectRoot, 'dist', 'main.js'),
  bundle: true,
  sourcemap: true,
  loader: { '.ts': 'ts', '.tsx': 'tsx' },
  jsx: 'automatic',
  format: 'esm',
  target: ['es2020'],
  logLevel: 'warning',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}

if (isWatch) {
  const ctx = await context(common)
  await ctx.watch()
  console.log(`esbuild watching (mode=${mode})`)
} else {
  await build({
    ...common,
    minify: mode === 'production',
  })
  console.log(`esbuild built (mode=${mode})`)
}


