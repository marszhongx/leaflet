import './style.css'

async function startApp() {
  const { startMapApp } = await import('./mapApp.js')

  startMapApp()
  document.body.classList.add('map-ready')
  loadInsights()
}

function loadInsights() {
  const load = () => {
    Promise.all([
      import('@vercel/analytics'),
      import('@vercel/speed-insights')
    ]).then(([analytics, speedInsights]) => {
      analytics.inject()
      speedInsights.injectSpeedInsights()
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load)
    return
  }

  window.setTimeout(load, 0)
}

startApp().catch((error) => {
  console.error(error)
})
