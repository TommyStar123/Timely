chrome.storage.local.set({
  allTabs: [],
})

const tab = {
  id: 0,
  url: '',
  title: '',
  sec: 0,
  tracked: false,
}

let activeTabId,
  lastUrl,
  lastTitle,
  timer,
  seconds = 0

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function pushTab(tabId, tabUrl, tabTitle) {
  if (lastUrl != tabUrl || lastTitle != tabTitle) {
    console.log((lastUrl = tabUrl), (lastTitle = tabTitle))
    chrome.storage.local.get(['allTabs'], function (result) {
      result.tabs.push(tabUrl)
      console.log(tabUrl)
      chrome.storage.local.set(
        {
          tabs: result.tabs,
        },
        function () {
          console.log(result.tabs)
        }
      )
    })
  }
}

async function setCurrent() {
  let tab = await getCurrentTab()
  activeTabId = tab.id
  lastUrl = tab.url
  lastTitle = tab.title
  timer = setInterval(() => {
    seconds++
  }, 1000)
}

setCurrent()

chrome.tabs.onActivated.addListener(async function () {
  let tab = await getCurrentTab()
  pushTab((activeTabId = tab.id), tab.url, tab.title)
  console.log(`total time was: ${seconds} seconds`)
  clearInterval(timer)
  seconds = 0
  timer = setInterval(() => {
    seconds++
  }, 1000)
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (activeTabId == tabId && tab.status === 'complete') {
    pushTab(tabId, tab.url, tab.title)
  }
})
