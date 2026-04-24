import { describe, expect, it } from 'vitest'
import { renderPopupContent } from './popupContent.js'

describe('renderPopupContent', () => {
  it('renders title, date, note, and all images for a complete place', () => {
    const html = renderPopupContent({
      name: '北京',
      date: '2025-10-01',
      note: '故宫和景山的秋天很好看。',
      images: ['/images/beijing-1.svg', '/images/beijing-2.svg']
    })

    expect(html).toContain('北京')
    expect(html).toContain('2025-10-01')
    expect(html).toContain('故宫和景山的秋天很好看。')
    expect(html).toContain('src="/images/beijing-1.svg"')
    expect(html).toContain('src="/images/beijing-2.svg"')
    expect(html).toContain('travel-popup__gallery')
  })

  it('omits the gallery block when images are empty', () => {
    const html = renderPopupContent({
      name: '上海',
      date: '2025-12-18',
      note: '晚上沿着外滩散步。',
      images: []
    })

    expect(html).toContain('上海')
    expect(html).not.toContain('travel-popup__gallery')
    expect(html).not.toContain('<img')
  })

  it('omits optional blocks when date and note are missing', () => {
    const html = renderPopupContent({
      name: '杭州',
      images: ['/images/hangzhou-1.svg']
    })

    expect(html).toContain('杭州')
    expect(html).not.toContain('travel-popup__meta')
    expect(html).not.toContain('travel-popup__note')
    expect(html).not.toContain('undefined')
  })
})
