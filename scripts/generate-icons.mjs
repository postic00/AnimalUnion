import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/icons/icon.svg')
const outDir = resolve(root, 'public/icons')

mkdirSync(outDir, { recursive: true })

const sizes = [1024, 512, 192, 144, 96, 72, 48]
const svgBuffer = readFileSync(svgPath)

for (const size of sizes) {
  const outPath = resolve(outDir, `icon-${size}.png`)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath)
  console.log(`✓ icon-${size}.png`)
}

console.log('\n아이콘 생성 완료!')
