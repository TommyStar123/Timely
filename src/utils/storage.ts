interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

export function getVal(key: string): any{
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

export function setVal(key: string, val: any): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        [key]: val
      },
      function () {
        resolve();
      }
    )
  })
}


