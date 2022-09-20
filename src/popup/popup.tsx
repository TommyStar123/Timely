import React, { useEffect, useState } from 'react'
import { useAsync } from 'react-async'
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

const App: React.FC<{}> = () => {
  const [allTabs, setAllTabs] = useState<tabObj[]>([])
  useEffect(() => {
    getStorageTabs('allTabs').then((tabs) => {
      setAllTabs(tabs)
    })
  }, [])
  useEffect(() => {
    setStorageTabs(allTabs)
  }, [allTabs])
  if (!allTabs) {
    return null
  }
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
        {allTabs?.map((tab, i) => (
          <tr>
            <td key={i}>{tab.title}</td>
            <td key={i}>{tab.domain}</td>
            <td key={i}>{tab.sec}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
