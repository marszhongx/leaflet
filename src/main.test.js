import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('main entrypoint', () => {
  it('injects Vercel Analytics and Speed Insights', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/main.js'), 'utf8')

    expect(source).toContain("import { inject } from '@vercel/analytics'")
    expect(source).toContain("import { injectSpeedInsights } from '@vercel/speed-insights'")
    expect(source).toContain('inject()')
    expect(source).toContain('injectSpeedInsights()')
  })
})
