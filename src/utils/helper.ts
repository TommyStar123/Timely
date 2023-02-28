export function getTime(): number{
  return Math.floor(Date.now() / 1000)
}

export function getDomain(url:string): string{
  let goodUrl: URL;
  if(url){
    try {
      goodUrl = new URL(url);
    } catch (_) {
      return "No Domain Found";
    }
    return goodUrl.hostname;
  } else{
    return "No Domain Found";
  }
}

export function removeItem<T>(arr: Array<T>, value: T): Array<T> { 
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function detectUnique<T>(arr: Array<T>, value: T): Boolean { 
  const index = arr.indexOf(value);
  if (index > -1) {
    return false;
  }
  return true;
}