function clampIndex(index, images) {
  if (images.length === 0) {
    return 0
  }

  return Math.min(Math.max(index, 0), images.length - 1)
}

function createLightboxDom() {
  const overlay = document.createElement('div')
  overlay.className = 'travel-lightbox'
  overlay.hidden = true
  overlay.setAttribute('aria-hidden', 'true')
  overlay.setAttribute('data-testid', 'lightbox-overlay')

  overlay.innerHTML = `
    <div class="travel-lightbox__backdrop" data-lightbox-close="true"></div>
    <div class="travel-lightbox__dialog" role="dialog" aria-modal="true" aria-label="图片预览">
      <button type="button" class="travel-lightbox__close" data-testid="lightbox-close" aria-label="关闭预览">×</button>
      <button type="button" class="travel-lightbox__nav travel-lightbox__nav--prev" data-testid="lightbox-prev" aria-label="上一张">‹</button>
      <figure class="travel-lightbox__figure">
        <img class="travel-lightbox__image" data-testid="lightbox-image" alt="" />
      </figure>
      <button type="button" class="travel-lightbox__nav travel-lightbox__nav--next" data-testid="lightbox-next" aria-label="下一张">›</button>
    </div>
  `

  document.body.append(overlay)

  return {
    overlay,
    image: overlay.querySelector('[data-testid="lightbox-image"]'),
    previousButton: overlay.querySelector('[data-testid="lightbox-prev"]'),
    nextButton: overlay.querySelector('[data-testid="lightbox-next"]'),
    closeButton: overlay.querySelector('[data-testid="lightbox-close"]')
  }
}

export function createLightbox() {
  const elements = createLightboxDom()
  const state = {
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  }

  function render() {
    const hasImages = state.images.length > 0
    const multipleImages = state.images.length > 1

    if (!state.isOpen || !hasImages) {
      elements.overlay.hidden = true
      elements.overlay.setAttribute('aria-hidden', 'true')
      elements.image.removeAttribute('src')
      elements.image.setAttribute('alt', '')
      elements.previousButton.hidden = true
      elements.nextButton.hidden = true
      return
    }

    const currentImage = state.images[state.currentIndex]

    elements.overlay.hidden = false
    elements.overlay.setAttribute('aria-hidden', 'false')
    elements.image.setAttribute('src', currentImage)
    elements.image.setAttribute('alt', `${state.title} 图片 ${state.currentIndex + 1}`)
    elements.previousButton.hidden = !multipleImages
    elements.nextButton.hidden = !multipleImages
  }

  function open({ images, startIndex, title }) {
    state.isOpen = true
    state.images = images
    state.currentIndex = clampIndex(startIndex, images)
    state.title = title
    render()
  }

  function close() {
    state.isOpen = false
    state.images = []
    state.currentIndex = 0
    state.title = ''
    render()
  }

  function showPrevious() {
    if (state.images.length <= 1) {
      return
    }

    state.currentIndex = clampIndex(state.currentIndex - 1, state.images)
    render()
  }

  function showNext() {
    if (state.images.length <= 1) {
      return
    }

    state.currentIndex = clampIndex(state.currentIndex + 1, state.images)
    render()
  }

  elements.previousButton.addEventListener('click', showPrevious)
  elements.nextButton.addEventListener('click', showNext)
  elements.closeButton.addEventListener('click', close)
  elements.overlay.addEventListener('click', (event) => {
    const target = event.target
    if (target instanceof HTMLElement && target.dataset.lightboxClose === 'true') {
      close()
    }
  })

  render()

  return {
    open,
    close,
    showPrevious,
    showNext,
    getState() {
      return {
        isOpen: state.isOpen,
        images: [...state.images],
        currentIndex: state.currentIndex,
        title: state.title
      }
    }
  }
}
