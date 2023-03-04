import { getVal, setVal } from '../utils/storage'
import { getTime, getDomain, detectUnique } from '../utils/helper'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
  icon: string
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    chrome.runtime.openOptionsPage();
    await setVal("trackedDomains", []);
    await setVal("allTabs", []);
    let tab = await getCurrentTab();
    await setVal("prevTab", { id: 0, domain: "chnogmmohmgcgldcllikbkflgmfmjlip", url: "chrome-extension://chnogmmohmgcgldcllikbkflgmfmjlip/options.html", title: "Timely", sec: 0, icon: "" });
    await setVal("pastTime", getTime());
    await setVal("activeTabId", tab.id);
    await setVal("trackAll", false);
    await setVal("darkMode", false);
  }
  // chrome.runtime.openOptionsPage();
  // await setVal("allTabs", []);
  // await setVal("trackedDomains", []);
})

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
  if (await oldTab(tab.domain)) {
    let allTabs: tabObj[] = await getVal('allTabs');
    for (let i = 0; i < allTabs.length; i++) {
      if (tab.domain === allTabs[i].domain) {
        allTabs[i].sec += tab.sec;
        await setVal("allTabs", allTabs);
      }
    }
  } else {
    let allTabs: tabObj[] = await getVal('allTabs');
    const newTab = {
      id: tab.id,
      domain: tab.domain,
      url: tab.url,
      title: tab.title,
      sec: tab.sec,
      icon: tab.icon
    }
    allTabs.push(newTab);
    let trackedDomains: string[] = await getVal('trackedDomains');
    trackedDomains.push(tab.domain);
    await setVal("allTabs", allTabs);
    await setVal("trackedDomains", trackedDomains);
  }
}

async function changePrevTab(oldId: number, currTab: chrome.tabs.Tab) {
  let domain = getDomain(currTab.url);
  let title = "Invalid Tab";
  let url = currTab.url;
  let icon = currTab.favIconUrl;
  if (currTab.title !== "") {
    title = currTab.title;
  } else {
    title = "Timely";
    url = currTab.pendingUrl;
    domain = getDomain(url);
  }
  await setVal("activeTabId", currTab.id);
  await setVal("activeTabDomain", domain);
  await setVal("prevTab", {
    id: oldId + 1,
    domain: domain,
    url: url,
    sec: 0,
    title: title,
    icon: icon
  });
}

chrome.tabs.onActivated.addListener(async function () {
  let currTab = await getCurrentTab();
  let prevTab: tabObj = await getVal("prevTab");
  await changePrevTab(prevTab.id, currTab);
  let trackedDomains = await getVal("trackedDomains");
  if (await getVal("trackAll") || !detectUnique(trackedDomains, getDomain(prevTab.url))) {
    let tempTab = prevTab;
    let pastTime = await getVal("pastTime");
    // console.log(`The total time was: ${getTime() - pastTime} seconds.\n For url: ${prevTab.url}, domain: ${prevTab.domain}`);
    tempTab.sec = getTime() - pastTime;
    await pushTab(tempTab);
  }
  await setVal("pastTime", getTime());
})

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (await getVal("activeTabId") === tabId && tab.status === 'complete' &&
    tab.url !== "" && getDomain(tab.url) !== "No Domain Found"
    && await getVal("activeTabDomain") !== getDomain(tab.url)) {
    let currTab = await getCurrentTab();
    let prevTab: tabObj = await getVal("prevTab");
    await changePrevTab(prevTab.id, currTab);
    let trackedDomains = await getVal("trackedDomains");
    if (await getVal("trackAll") || !detectUnique(trackedDomains, getDomain(prevTab.url))) {
      let tempTab = prevTab;
      tempTab.sec = getTime() - await getVal("pastTime");
      await pushTab(tempTab);
    }
    await setVal("pastTime", getTime());
  }
})
