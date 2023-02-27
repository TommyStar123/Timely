import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button';
import './options.css'

import { getVal, setVal } from '../utils/storage'
import { getDomain } from '../utils/helper'

interface tabObj {
  id: number
  domain: string
  url: string
  title: string
  sec: number
}
class NameForm extends React.Component {
    handleSubmit = (event): void => {
        event.preventDefault();
        console.log(event.target[0].value);
        // const formData = new FormData(event.target);
        // const formJson = Object.fromEntries(formData.entries());
        // console.log(formJson);
        // getVal("trackedDomains").then((domains: string[]) => {
        //     domains.push(getDomain(event.target.url));
        //     setVal("trackedDoms", domains);
        // })
    }
    render(){
        return(
            <span className='flex'>
                <Card>
                    <Card.Header as="h5">Timely - Website Tracking Configuration</Card.Header>
                    <Card.Body>
                        {/* <Card.Title>Website Tracking Configuration</Card.Title> */}
                        <Card.Text>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Commonly Tracked Websites: </Form.Label>
                                    {['Youtube', 'Netflix'].map((site) => (
                                        <span key={ site } className="mb-2">
                                            <Form.Check 
                                                type="checkbox"
                                                name={ site }
                                                id="default-checkbox"
                                                label={ site }
                                                aria-describedby="track${site}"
                                            />
                                        </span>
                                    ))}
                                    <Form.Label htmlFor="url">Enter the URL of the website you would like to track:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="url"
                                        id="url"
                                        aria-describedby="urlToTrack"
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">Submit</Button>
                            </Form>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </span>
        )
    }
}

const root = document.createElement('span')
document.body.appendChild(root)
ReactDOM.render(<NameForm />, root)
