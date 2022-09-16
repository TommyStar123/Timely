import React from 'react'
import ReactDOM from 'react-dom'

const test = <p>Hello World!</p>

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(test, document.body)
