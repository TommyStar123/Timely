export function getTime(): number{
  return Math.floor(Date.now() / 1000)
}

export function getDomain(url:string): string{
  if(url){
    return new URL(url).hostname;
  } else{
    return "No Domain Found"
  }
}