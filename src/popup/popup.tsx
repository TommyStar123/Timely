import React, { useEffect, useState } from 'react'
import { useAsync } from 'react-async'
import ReactDOM from 'react-dom'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import 'bootstrap/dist/css/bootstrap.min.css'

import { getVal, setVal } from '../utils/storage'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

const App: React.FC<{}> = () => {
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
  // useEffect(() => {
  //   setStorageTabs(allTabs)
  // }, [allTabs])
  // if (!allTabs) {
  //   return null
  // }
  return (
    <Table striped bordered size="sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>Domain</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
         <tr>
          <th>{currTab.title}</th>
          <th>{currTab.domain}</th>
          <th>{currTab.sec}</th>
        </tr>
        {allTabs?.map((tab) => (
          <tr key={tab.id}>
            <td >{tab.title}</td>
            <td >{tab.domain}</td>
            <td >{tab.sec}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
