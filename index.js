// ==UserScript==
// @name         Clean Twitter
// @namespace    http://antfu.me/
// @version      0.3.1
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
// @run-at       document-body
// ==/UserScript==

(function () {
  'use strict'

  function useOption(key, title, defaultValue) {
    if (typeof GM_getValue === 'undefined') {
      return {
        value: defaultValue,
      }
    }

    let value = GM_getValue(key, defaultValue)
    const ref = {
      get value() {
        return value
      },
      set value(v) {
        value = v
        GM_setValue(key, v)
        location.reload()
      },
    }

    GM_registerMenuCommand(`${title}: ${value ? '✅' : '❌'}`, () => {
      ref.value = !value
    })

    return ref
  }

  const hideHomeTabs = useOption('twitter_hide_home_tabs', 'Hide Home Tabs', true)
  const hideBlueBadge = useOption('twitter_hide_blue_badge', 'Hide Blue Badges', true)

  const style = document.createElement('style')
  const hides = [
    // menu
    '[aria-label="Communities (New items)"], [aria-label="Communities"], [aria-label="Twitter Blue"], [aria-label="Verified"], [aria-label="Timeline: Trending now"], [aria-label="Who to follow"], [aria-label="Search and explore"], [aria-label="Verified Organizations"]',
    // submean
    '* > [href="/i/verified-orgs-signup"]',
    // sidebar
    '[aria-label="Trending"] > * > *:nth-child(3), [aria-label="Trending"] > * > *:nth-child(4), [aria-label="Trending"] > * > *:nth-child(5)',
    // "Verified" tab
    '[role="presentation"]:has(> [href="/notifications/verified"][role="tab"])',
    // verified badge
    hideBlueBadge.value && '*:has(> * > [aria-label="Verified account"])',
    // Home tabs
    hideHomeTabs.value && '[role="tablist"]:has([href="/home"][role="tab"])',
  ].filter(Boolean)

  style.innerHTML = [
    `${hides.join(',')}{ display: none !important; }`,
    // styling
    '[aria-label="Search Twitter"] { margin-top: 20px !important; }',
  ].join('')

  document.body.appendChild(style)

  // Select "Following" tab on home page, if not
  if (hideHomeTabs.value) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.location.pathname === '/home') {
          const tabs = document.querySelectorAll('[href="/home"][role="tab"]')
          if (tabs.length === 2 && tabs[1].getAttribute('aria-selected') === 'false')
            tabs[1].click()
        }
      }, 500)
    })
  }
})()
