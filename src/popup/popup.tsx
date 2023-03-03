import React, { useEffect, useState } from 'react'
import { useAsync } from 'react-async'
import ReactDOM from 'react-dom'
import Table from 'react-bootstrap/Table'

import 'bootstrap/dist/css/bootstrap.min.css'
import './popup.css'

import { getVal } from '../utils/storage'
import { getTime, formatSec } from '../utils/helper'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
  icon: string
}

const App: React.FC<{}> = () => {
  const [seconds, setSeconds] = useState(getTime() - getVal('pastTime'));
  const [allTabs, setAllTabs] = useState<tabObj[]>([]);
  const [prevTab, setPrevTab] = useState<tabObj>(getVal('prevTab')); //prevTab is actually the current tab if you think about it since I use the currentTab as prevTab when calculating times for the new tab
  useEffect(() => {
    getVal('allTabs').then((tabs: tabObj[]) => {
      setAllTabs(tabs);
    })
    getVal('prevTab').then((tab: tabObj) => {
      setPrevTab(tab);
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

  return (
    <Table responsive="xl" bordered size="md">
      <thead>
        <tr>
          <th>Name</th>
          <th>Domain</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {(prevTab.title ? (prevTab.title.split(' ').join('').length > 30) : (false)) ? (
            <th className={'nameCol'}>{prevTab.title.substring(0, 31)}...</th>
          ) : (
            <th className={'nameCol'}>{prevTab.title ? prevTab.title.split(' ').join('') : "No Title Found"}</th>
          )}

          {(prevTab.domain ? (prevTab.domain.length > 30) : (false)) ? (
            <th className={'domCol'}>{prevTab.domain.substring(0, 31).trim()}...</th>
          ) : (
            <th className={'domCol'}>{prevTab.domain}</th>
          )}

          <th className={'secCol'}>{formatSec(seconds)}</th>

        </tr>
        {allTabs?.map((tab) => (
          <tr key={tab.id}>
            {(tab.title ? (tab.title.length > 30) : (false)) ? (
              <td className={'nameCol'}>{tab.title.substring(0, 31).trim()}...</td>
            ) : (
              <td className={'nameCol'}>{tab.title}</td>
            )}

            {(tab.domain ? (tab.domain.length > 30) : (false)) ? (
              <td className={'domCol'}>{tab.domain.substring(0, 31).trim()}...</td>
            ) : (
              <td className={'domCol'}>{tab.domain}</td>
            )}

            <td className={'secCol'}>{formatSec(tab.sec)}</td>

          </tr>
        ))}
      </tbody>
    </Table>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
