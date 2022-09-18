import { getStorageTabs, setStorageTabs } from '../utils/storage'

const DOMAIN_REGEX =
  /(?:[-a-zA-Z0-9@:%_\+~.#=]{2,256}\.)?([-a-zA-Z0-9@:%_\+~#=]*)\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/i

chrome.storage.local.set({
  allTabs: [],
})

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

let activeTabId,
  lastUrl: string,
  lastTitle,
  timer,
  seconds = 0

let prevTab = {
  id: 0,
  domain: '',
  url: '',
  title: '',
  sec: 0,
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function oldTab(newDom: string) {
  let allTabs: tabObj[] = await getStorageTabs('allTabs')
  if (allTabs.length != 0) {
    for (let i = 0; i < allTabs.length; i++) {
      if (allTabs[i].domain === newDom) {
        console.log(allTabs[i].domain + ' ' + newDom)
        return true
      }
    }
    return false
  }
  return false
}

async function pushTab(tab: tabObj) {
  if (lastUrl != tab.url || lastTitle != tab.title) {
    if (await oldTab(tab.domain)) {
      console.log('loop')
      lastUrl = tab.url
      lastTitle = tab.title
      let allTabs: tabObj[] = await getStorageTabs('allTabs')
      for (let i = 0; i < allTabs.length; i++) {
        if (tab.domain === allTabs[i].domain) {
          allTabs[i].sec += tab.sec
          await setStorageTabs(allTabs)
        }
      }
    } else {
      console.log('here')
      lastUrl = tab.url
      lastTitle = tab.title
      let allTabs: tabObj[] = await getStorageTabs('allTabs')
      const newTab = {
        id: tab.id,
        domain: tab.domain,
        url: tab.url,
        title: tab.title,
        sec: tab.sec,
      }
      allTabs.push(newTab)
      await setStorageTabs(allTabs)
    }
  }
}

async function changePrevTab() {
  clearInterval(timer)
  console.log(`The total time was: ${seconds} seconds`)
  let tab = await getCurrentTab()
  if (tab.url.includes('.') === false) {
    console.log('invalid tab')
    return
  }
  activeTabId = tab.id
  prevTab = {
    id: tab.id,
    domain: `${tab.url.match(DOMAIN_REGEX)[1]}`,
    url: tab.url,
    sec: 0,
    title: tab.title,
  }
  seconds = 0
  timer = setInterval(() => {
    seconds++
  }, 1000)
}

chrome.tabs.onActivated.addListener(async function () {
  if (prevTab.url === '') {
    console.log('starting tab')
    await changePrevTab()
  } else {
    let tab = await getCurrentTab()
    let tempTab = prevTab
    tempTab.sec = seconds
    await changePrevTab()
    await pushTab(tempTab)
  }
})

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (activeTabId === tabId && tab.status === 'complete') {
    let tempTab = prevTab
    tempTab.sec = seconds
    await changePrevTab()
    await pushTab(tempTab)
  }
})
