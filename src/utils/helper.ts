export function getTime(): number {
  return Math.floor(Date.now() / 1000)
}

export function getDomain(url: string): string {
  let goodUrl: URL;
  if (url) {
    try {
      goodUrl = new URL(url);
    } catch (_) {
      return "No Domain Found";
    }
    return goodUrl.hostname;
  } else {
    return "No Domain Found";
  }
}

export function removeFalse(newDomains: Map<string, boolean>): Map<string, boolean> {
  for (let [key, value] of newDomains.entries()) {
    if (value) {
      newDomains.delete(key);
    }
  }
  return newDomains
}

export function detectUnique<T>(arr: Array<T>, value: T): Boolean {
  const index = arr.indexOf(value);
  if (index > -1) {
    return false;
  }
  return true;
}

export function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function formatSec(x: number) {
  x = Number(x);
  let d = Math.floor(x / (24 * 3600));
  let h = Math.floor(x % (3600 * 24) / 3600);
  let m = Math.floor(x % 3600 / 60);
  let s = Math.floor(x % 3600 % 60);
  let dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") + (h > 0 || m > 0 || s > 0 ? ", " : "") : "";
  let hDisplay = h > 0 ? h + (h == 1 ? " hr" : " hrs") + (m > 0 || s > 0 ? ", " : "") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " min" : " mins") + (s >= 0 ? ", " : "") : "";
  let sDisplay = s + (s == 1 ? " sec" : " secs");
  // let sDisplay = s >= 0 ? s + (s == 1 ? " sec" : " secs") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}