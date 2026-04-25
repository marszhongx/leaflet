import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/main.js'), 'utf8')

describe('main entrypoint', () => {
  it('loads the map app asynchronously', () => {
    expect(source).toContain("import('./mapApp.js')")
    expect(source).not.toContain("import L from 'leaflet'")
    expect(source).not.toContain("import 'leaflet/dist/leaflet.css'")
  })

  it('loads Vercel Analytics and Speed Insights dynamically', () => {
    expect(source).toContain("import('@vercel/analytics')")
    expect(source).toContain("import('@vercel/speed-insights')")
    expect(source).not.toContain("import { inject } from '@vercel/analytics'")
    expect(source).not.toContain("import { injectSpeedInsights } from '@vercel/speed-insights'")
  })

  it('marks the page ready after the map app starts', () => {
    expect(source).toContain("document.body.classList.add('map-ready')")
  })
})
