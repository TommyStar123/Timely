import React, { useEffect, useState } from 'react'
import { useAsync } from 'react-async'
import ReactDOM from 'react-dom'
import Table from 'react-bootstrap/Table'

import 'bootstrap/dist/css/bootstrap.min.css'
import './popup.css'

import { getVal } from '../utils/storage'
import { getTime } from '../utils/helper'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

function formatSec(x) {
  x= Number(x); 
  let d=Math.floor(x / (24*3600)); 
  let h=Math.floor(x % (3600*24) / 3600 ); 
  let m=Math.floor(x % 3600 / 60); 
  let s=Math.floor(x % 3600 % 60); 
  let dDisplay=d>0? d + (d==1? " day" : " days") + (h>0 || m > 0 || s > 0 ? ", ":"") : ""; 
  let hDisplay=h>0? h + (h==1? " hr" : " hrs") + (m > 0 || s > 0 ? ", ":"") : ""; 
  let mDisplay=m>0? m + (m==1? " min" : " mins") + (s >= 0 ? ", ":"") : ""; 
  let sDisplay=s>=0? s + (s==1? " sec" : " secs") : ""; 
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

const App: React.FC<{}> = () => {
  const [seconds, setSeconds] = useState(getTime() - getVal('pastTime'));
  const [allTabs, setAllTabs] = useState<tabObj[]>([]);
  const [currTab, setCurrTab] = useState<tabObj>(getVal('currTab'));
  useEffect(() => {
    getVal('allTabs').then((tabs: tabObj[]) => {
      setAllTabs(tabs);
    })
    getVal('currTab').then((tab: tabObj) => {
      setCurrTab(tab);
    })
  }, [])

  useEffect(() => {
    getVal('pastTime').then((sec: number) => {
          setSeconds(getTime() - sec);
    })
    const interval = setInterval(() => {
        getVal('pastTime').then((sec: number) => {
          setSeconds(getTime() - sec);
        })
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  // useEffect(() => {
  //   setStorageTabs(allTabs)
  // }, [allTabs])
  // if (!allTabs) {
  //   return null
  // }
  return (
    <Table responsive="sm" bordered size="md">
      <thead>
        <tr>
          <th>Name</th>
          <th>Domain</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
         <tr>
          { (currTab.title ? (currTab.title.length > 30) : (false)) ? (
            <th>{currTab.title.substring(0, 31)}...</th>
          ):(
            <th>{currTab.title}</th>
          )}

          { (currTab.domain ? (currTab.domain.length > 30) : (false)) ? (
            <th className = {'domCol'}>{currTab.domain.substring(0, 31).trim()}...</th>
            ):(
            <th className = {'domCol'}>{currTab.domain}</th>
          )}

          <th className = {'secCol'}>{formatSec(seconds)}</th>

        </tr>
        {allTabs?.map((tab) => (
          <tr key={tab.domain}>
            { (tab.title ? (tab.title.length > 30) : (false)) ? (
              <td>{tab.title.substring(0, 31).trim()}...</td>
            ):(
              <td>{tab.title}</td>
            )}

            { (tab.domain ? (tab.domain.length > 30) : (false)) ? (
              <td className = {'domCol'}>{tab.domain.substring(0, 31).trim()}...</td>
            ):(
              <td className = {'domCol'}>{tab.domain}</td>
            )}

            <td className = {'secCol'}>{formatSec(tab.sec)}</td>

          </tr>
        ))}
      </tbody>
    </Table>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
