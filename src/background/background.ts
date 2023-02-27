import { getVal, setVal } from '../utils/storage'
import { getTime, getDomain } from '../utils/helper'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

chrome.runtime.onInstalled.addListener(async ({reason}) => {
  // if (reason === 'install'){
  //   chrome.runtime.openOptionsPage();
  // }
  chrome.runtime.openOptionsPage();
  // let url = chrome.runtime.getURL('install.tsx')
  // let tab = await chrome.tabs.create({ url })
  // await setVal("allTabs", []);
  await setVal("prevTab", {id: 0, domain: 'No Domain Found', url: 'Invalid URL', title: 'Invalid Tab', sec: -1 });
  await setVal("pastTime", getTime());
  await setVal("lastUrl", '');
  await setVal("lastTitle", '');
  await setVal("trackedDomains", []);
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
      await setVal("lastUrl", tab.url);
      await setVal("lastTitle", tab.title);
      let allTabs: tabObj[] = await getVal('allTabs');
      for (let i = 0; i < allTabs.length; i++) {
        if (tab.domain === allTabs[i].domain) {
          allTabs[i].sec += tab.sec;
          await setVal("allTabs", allTabs);
        }
      }
    } else {
      await setVal("lastUrl", tab.url);
      await setVal("lastTitle", tab.title);
      let allTabs: tabObj[] = await getVal('allTabs');
      const newTab = {
        id: tab.id,
        domain: tab.domain,
        url: tab.url,
        title: tab.title,
        sec: tab.sec,
      }
      allTabs.push(newTab);
      await setVal("allTabs", allTabs);
    }
  }
}

async function changePrevTab() {
  let tab = await getCurrentTab();
  // if (tab.url.includes('.') === false) {
  //   console.log('invalid tab')
  //   return
  // }
  await setVal("activeTabId", tab.id);
  let hostname = getDomain(tab.url);
  await setVal("prevTab", {
    id: tab.id,
    domain: hostname,
    url: tab.url,
    sec: 0,
    title: tab.title,
  });
}

chrome.tabs.onActivated.addListener(async function () {
  let currTab = await getCurrentTab();
  let hostname = getDomain(currTab.url);
  let title = "Invalid Tab";
  if(currTab.title){
    title = currTab.title;
  }
  await setVal("currTab", { id: currTab.id, domain: hostname, url: currTab.url, sec: 0, title: title });
  let prevTab:tabObj = await getVal("prevTab");
  if (prevTab.sec === -1) {
    console.log('starting tab');
    await changePrevTab();
  } else {
    let tempTab = prevTab;
    let pastTime = await getVal("pastTime");
    console.log(`The total time was: ${getTime() - pastTime} seconds.\n For url: ${prevTab.url}, domain: ${prevTab.domain}`);
    tempTab.sec = getTime() - pastTime;
    await setVal("pastTime", getTime());
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
