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
  lastUrl,
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

// async function setCurrent() {
//   let tab = await getCurrentTab()
//   activeTabId = tab.id
//   lastUrl = tab.url
//   lastTitle = tab.title
//   timer = setInterval(() => {
//     seconds++
//   }, 1000)
// }

// setCurrent()

const getStorageTabs = async (key): Promise<tabObj[]> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['allTabs'], function (result) {
      if (result['allTabs'] === undefined) {
        reject()
      } else {
        resolve(result.allTabs)
      }
    })
  })
}

const setStorageTabs = async (arr: tabObj[]) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        allTabs: arr,
      },
      function () {
        console.log(arr)
      }
    )
  })
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
  // if (lastUrl != tab.url || lastTitle != tab.title) {
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

chrome.tabs.onActivated.addListener(async function () {
  clearInterval(timer)
  console.log(`The total time was: ${seconds} seconds`)
  if (prevTab.url === '') {
    console.log('starting tab')
    let tab = await getCurrentTab()
    if (tab.url.includes('.') === false) {
      console.log('invalid tab')
      return
    }
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
  } else {
    let tempTab = prevTab
    tempTab.sec = seconds
    let tab = await getCurrentTab()
    if (tab.url.includes('.') === false) {
      console.log('invalid tab')
      return
    }
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
    await pushTab(tempTab)
  }
})

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (activeTabId == tabId && tab.status === 'complete') {
    clearInterval(timer)
    console.log(`The total time was: ${seconds} seconds`)
    await pushTab(prevTab)
    seconds = 0
    timer = setInterval(() => {
      seconds++
    }, 1000)
    let tab = await getCurrentTab()
    if (tab.url.includes('.') === false) {
      console.log('bad')
      return
    }
    prevTab = {
      id: tab.id,
      domain: `${tab.url.match(DOMAIN_REGEX)[1]}`,
      url: tab.url,
      sec: 0,
      title: tab.title,
    }
  }
})
