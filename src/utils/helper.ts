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

export function removeFalse<T>(newDomains: Map<string, boolean>): Map<string, boolean> {
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
