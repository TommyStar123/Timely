interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

export function getStorageTabs(key: string): any{
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        reject()
      } else {
        resolve(result[key])
      }
    })
  })
}

export function setStorageTabs(arr: tabObj[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        allTabs: arr
      },
      function () {
        console.log(arr ?? [])
        resolve()
      }
    )
  })
}

export function setCurrentTab(currTab: tabObj): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        currTab: currTab
      },
      function () {
        resolve()
      }
    )
  })
}
