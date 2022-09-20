interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

export function getStorageTabs(key: string): Promise<tabObj[]> {
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
        allTabs: arr,
      },
      function () {
        console.log(arr ?? [])
        resolve()
      }
    )
  })
}
