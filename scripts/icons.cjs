// Erzeugt die App-Icons aus SVG. Aufruf: node scripts/icons.cjs (braucht Playwright, nur bei Änderungen am Icon nötig)
const { chromium } = require('playwright')
const path = require('path')
const out = (f) => path.resolve(__dirname, '..', 'assets', f)
const bag = (fg, check) => `
  <path d="M150 196h212l-18 186a28 28 0 0 1-28 25H196a28 28 0 0 1-28-25z" fill="${fg}"/>
  <path d="M200 196v-22a56 56 0 0 1 112 0v22" fill="none" stroke="${fg}" stroke-width="26" stroke-linecap="round"/>
  ${check ? `<path d="M204 300l36 36 70-74" fill="none" stroke="${check}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34c27a"/><stop offset="1" stop-color="#1e9a5a"/></linearGradient></defs>`
const svgs = {
  'icon.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" fill="url(#g)"/><g transform="translate(256 256) scale(0.8) translate(-256 -262)">${bag('#fff', '#1e9a5a')}</g></svg>`],
  // Android: Vordergrund im sicheren Bereich (ca. 66 %), Hintergrund separat
  'android-icon-foreground.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(0.6) translate(-256 -262)">${bag('#fff', '#1e9a5a')}</g></svg>`],
  'android-icon-background.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" fill="url(#g)"/></svg>`],
  'android-icon-monochrome.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(0.6) translate(-256 -262)"><mask id="m"><rect width="512" height="512" fill="#fff"/><path d="M204 300l36 36 70-74" fill="none" stroke="#000" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/></mask><g mask="url(#m)">${bag('#fff')}</g></g></svg>`],
  'splash-icon.png': [512, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" rx="112" fill="url(#g)"/><g transform="translate(256 256) scale(0.8) translate(-256 -262)">${bag('#fff', '#1e9a5a')}</g></svg>`],
  'favicon.png': [48, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" rx="112" fill="url(#g)"/>${bag('#fff', '#1e9a5a')}</svg>`],
}
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const [file, [size, svg]] of Object.entries(svgs)) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style><img width="${size}" height="${size}" style="display:block" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`)
    await page.screenshot({ path: out(file), omitBackground: true })
  }
  await browser.close()
})()
