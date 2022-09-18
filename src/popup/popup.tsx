import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import 'bootstrap/dist/css/bootstrap.min.css'

import { getStorageTabs, setStorageTabs } from '../utils/storage'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}

let Tabs: tabObj[]

// async function getTabs() {
//   Tabs = await getStorageTabs('allTabs')
//   console.log('getting ' + Tabs)
// }

const App: React.FC<{}> = () => {
  const [allTabs] = useState<tabObj[]>([])
  useEffect(() => {
    console.log('HI')
    getStorageTabs('allTabs').then((allTabs) => {
      if (allTabs) {
        console.log(allTabs)
      } else {
        console.log('UHOH')
      }
    })
  })
  return (
    <Table striped bordered size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th>Tab Name</th>
          <th>Tab Url</th>
          <th>Tracked</th>
        </tr>
      </thead>
      <tbody>
        {allTabs?.map(function (tab, i) {
          return (
            <tr>
              <td key={i}>{tab.url}</td>
              <td key={i}>{tab.title}</td>
              <td key={i}>{tab.url}</td>
              <td key={i}>true</td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
// if (Tabs) {
//   ReactDOM.render(<App />, root)
// } else {
//   getTabs
//   ReactDOM.render(<App />, root)
// }
