import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { places } from './places.js'

describe('places', () => {
  it('references image files that exist in public/images', () => {
    const missingImages = places.flatMap((place) =>
      (place.images ?? []).filter((imagePath) => !existsSync(resolve(process.cwd(), `public${imagePath}`)))
    )

    expect(missingImages).toEqual([])
  })
})
