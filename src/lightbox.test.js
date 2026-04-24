import { beforeEach, describe, expect, it } from 'vitest'
import { createLightbox } from './lightbox.js'

describe('createLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens with the clicked image and updates the visible image source', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/beijing-1.png', '/images/beijing-2.png'],
      startIndex: 1,
      title: '北京'
    })

    const image = document.querySelector('[data-testid="lightbox-image"]')

    expect(lightbox.getState()).toEqual({
      isOpen: true,
      images: ['/images/beijing-1.png', '/images/beijing-2.png'],
      currentIndex: 1,
      title: '北京'
    })
    expect(image?.getAttribute('src')).toBe('/images/beijing-2.png')
    expect(image?.getAttribute('alt')).toBe('北京 图片 2')
  })

  it('moves backward and forward inside the current place image list', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/beijing-1.png', '/images/beijing-2.png'],
      startIndex: 1,
      title: '北京'
    })

    lightbox.showPrevious()
    expect(lightbox.getState().currentIndex).toBe(0)

    lightbox.showNext()
    expect(lightbox.getState().currentIndex).toBe(1)

    const image = document.querySelector('[data-testid="lightbox-image"]')
    expect(image?.getAttribute('src')).toBe('/images/beijing-2.png')
  })

  it('hides navigation buttons for a single-image place', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/hangzhou-1.png'],
      startIndex: 0,
      title: '杭州'
    })

    const previousButton = document.querySelector('[data-testid="lightbox-prev"]')
    const nextButton = document.querySelector('[data-testid="lightbox-next"]')

    expect(previousButton?.hasAttribute('hidden')).toBe(true)
    expect(nextButton?.hasAttribute('hidden')).toBe(true)

    lightbox.showNext()
    expect(lightbox.getState().currentIndex).toBe(0)
  })

  it('resets state and hides the overlay when closed', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/shanghai-1.png', '/images/shanghai-2.png'],
      startIndex: 0,
      title: '上海'
    })

    lightbox.close()

    const overlay = document.querySelector('[data-testid="lightbox-overlay"]')

    expect(lightbox.getState()).toEqual({
      isOpen: false,
      images: [],
      currentIndex: 0,
      title: ''
    })
    expect(overlay?.getAttribute('aria-hidden')).toBe('true')
    expect(overlay?.hasAttribute('hidden')).toBe(true)
  })

  it('clamps an out-of-range start index to the last available image', () => {
    const lightbox = createLightbox()

    lightbox.open({
      images: ['/images/beijing-1.png', '/images/beijing-2.png'],
      startIndex: 9,
      title: '北京'
    })

    expect(lightbox.getState().currentIndex).toBe(1)
  })
})
