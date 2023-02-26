import { getVal, setVal } from '../utils/storage'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

function getTime () {
  return Math.floor(Date.now() / 1000)
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('INSTALLED');
  // let url = chrome.runtime.getURL('install.tsx')
  // let tab = await chrome.tabs.create({ url })
  setVal("allTabs", []);
  setVal("prevTab", {id: 0, domain: '', url: '', title: '', sec: -1 });
  setVal("pastTime", getTime());
  setVal("lastUrl", '');
  setVal("lastTitle", '');
})



async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function oldTab(newDom: string) {
  let allTabs: tabObj[] = await getVal('allTabs');
  if (allTabs.length != 0) {
    for (let i = 0; i < allTabs.length; i++) {
      if (allTabs[i].domain === newDom) {
        console.log(allTabs[i].domain + ' ' + newDom);
        return true;
      }
    }
    return false;
  }
  return false;
}

async function pushTab(tab: tabObj) {
  let lastUrl = await getVal("lastUrl");
  let lastTitle = await getVal("lastTitle");
  if (lastUrl != tab.url || lastTitle != tab.title) {
    if (await oldTab(tab.domain)) {
      setVal("lastUrl", tab.url);
      setVal("lastTitle", tab.title);
      let allTabs: tabObj[] = await getVal('allTabs');
      for (let i = 0; i < allTabs.length; i++) {
        if (tab.domain === allTabs[i].domain) {
          allTabs[i].sec += tab.sec;
          setVal("allTabs", allTabs);
        }
      }
    } else {
      setVal("lastUrl", tab.url);
      setVal("lastTitle", tab.title);
      let allTabs: tabObj[] = await getVal('allTabs');
      const newTab = {
        id: tab.id,
        domain: tab.domain,
        url: tab.url,
        title: tab.title,
        sec: tab.sec,
      }
      allTabs.push(newTab);
      setVal("allTabs", allTabs);
    }
  }
}

async function changePrevTab() {
  let tab = await getCurrentTab();
  // if (tab.url.includes('.') === false) {
  //   console.log('invalid tab')
  //   return
  // }
  setVal("activeTabId", tab.id);
  let url = new URL(tab.url);
  let hostname = url.hostname;
  setVal("prevTab", {
    id: tab.id,
    domain: hostname,
    url: tab.url,
    sec: 0,
    title: tab.title,
  });
}

chrome.tabs.onActivated.addListener(async function () {
  let currTab = await getCurrentTab();
  let url = new URL(currTab.url);
  let hostname = url.hostname;
  setVal("currTab", { id: currTab.id, domain: hostname, url: currTab.url, sec: 0, title: currTab.title });
  let prevTab:tabObj = await getVal("prevTab");
  if (prevTab.sec === -1) {
    console.log('starting tab');
    await changePrevTab();
  } else {
    let tempTab = prevTab;
    let pastTime = await getVal("pastTime");
    console.log(`The total time was: ${getTime() - pastTime} seconds`);
    tempTab.sec = getTime() - pastTime;
    setVal("pastTime", getTime());
    await changePrevTab();
    await pushTab(tempTab);
  }
})

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (await getVal("activeTabId") === tabId && tab.status === 'complete') {
    let prevTab:tabObj = await getVal("prevTab");
    let tempTab = prevTab;
    tempTab.sec = getTime() - await getVal("pastTime");
    await changePrevTab();
    await pushTab(tempTab);
  }
})
