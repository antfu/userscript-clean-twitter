// ==UserScript==
// @name         Clean Twitter
// @namespace    http://antfu.me/
// @version      0.2.0
// @description  Bring back peace on Twitter
// @author       Anthony Fu (https://github.com/antfu)
// @license      MIT
// @homepageURL  https://github.com/antfu/userscript-clean-twitter
// @supportURL   https://github.com/antfu/userscript-clean-twitter
// @match        https://twitter.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict'

  const defaultMenuAll = {
    'Hide Home tabs': true,
  }
  const menuAll = GM_getValue('menu_all', defaultMenuAll)
  function syncMenuWithDefault(menuAll, defaultMenuAll) {
  // Add new menu from default, if not exist yet
    for (const name in defaultMenuAll) {
      if (!(name in menuAll))
        menuAll[name] = defaultMenuAll[name]
    }
    // Remove old menu, if not exist in default
    for (const name in menuAll) {
      if (!(name in defaultMenuAll))
        delete menuAll[name]
    }
    GM_setValue('menu_all', menuAll)
  }
  syncMenuWithDefault(menuAll, defaultMenuAll)

  const menuIds = GM_getValue('menu_ids', {})
  function registerMenuCommand(name, value) {
    const menuText = ` ${name}: ${value ? '✅' : '❌'}`
    const commandCallback = () => {
      menuAll[name] = !menuAll[name]
      GM_setValue('menu_all', menuAll)
      updateMenu()
      location.reload()
    }
    return GM_registerMenuCommand(menuText, commandCallback)
  }
  function updateMenu() {
    for (const name in menuAll) {
      const value = menuAll[name]
      if (menuIds[name])
        GM_unregisterMenuCommand(menuIds[name])

      menuIds[name] = registerMenuCommand(name, value)
    }
    GM_setValue('menu_ids', menuIds)
  }
  updateMenu()

  const style = document.createElement('style')
  const hides = [
    // verified badge
    '*:has(> * > [aria-label="Verified account"])',
    // menu
    '[aria-label="Communities (New items)"], [aria-label="Communities"], [aria-label="Twitter Blue"], [aria-label="Timeline: Trending now"], [aria-label="Who to follow"], [aria-label="Search and explore"], [aria-label="Verified Organizations"]',
    // submean
    '* > [href="/i/verified-orgs-signup"]',
    // sidebar
    '[aria-label="Trending"] > * > *:nth-child(3), [aria-label="Trending"] > * > *:nth-child(4)',
    // "Verified" tab
    '[role="presentation"]:has(> [href="/notifications/verified"][role="tab"])',
    // Home tabs
    menuAll['Hide Home tabs'] ? '[role="tablist"]:has([href="/home"][role="tab"])' : '',
  ]
  style.innerHTML = [
    `${hides.filter(s => s !== '').join(',')}{ display: none !important; }`,
    // styling
    '[aria-label="Search Twitter"] { margin-top: 20px !important; }',
  ].join('')
  document.body.appendChild(style)

  window.addEventListener('load', () => {
    setTimeout(() => {
      // Select "Following" tab on home page, if not
      if (window.location.pathname === '/home') {
        const tabs = document.querySelectorAll('[href="/home"][role="tab"]')
        if (tabs.length === 2 && tabs[1].getAttribute('aria-selected') === 'false')
          tabs[1].click()
      }
    }, 500)
  })
})()
