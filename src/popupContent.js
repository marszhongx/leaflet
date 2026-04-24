function renderImageList(images, title) {
  if (!images || images.length === 0) {
    return ''
  }

  const items = images
    .map(
      (image, index) => `
        <button
          type="button"
          class="travel-popup__thumb-button"
          data-image-index="${index}"
          aria-label="查看 ${title} 图片 ${index + 1}"
        >
          <img
            class="travel-popup__image"
            src="${image}"
            alt="${title} 图片 ${index + 1}"
          />
        </button>
      `
    )
    .join('')

  return `<div class="travel-popup__gallery">${items}</div>`
}

export function renderPopupContent(place) {
  const title = `<h3 class="travel-popup__title">${place.name}</h3>`
  const date = place.date
    ? `<p class="travel-popup__meta">${place.date}</p>`
    : ''
  const note = place.note
    ? `<p class="travel-popup__note">${place.note}</p>`
    : ''
  const gallery = renderImageList(place.images, place.name)

  return `
    <article class="travel-popup">
      ${title}
      ${date}
      ${note}
      ${gallery}
    </article>
  `.trim()
}
