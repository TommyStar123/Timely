import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';
import { XCircle } from 'react-bootstrap-icons';
import { Badge, Col, FloatingLabel, InputGroup, Row, Table } from 'react-bootstrap'
import './options.css'

import { getVal, setVal } from '../utils/storage'
import { getDomain, removeFalse, detectUnique } from '../utils/helper'

interface tabObj {
    id: number
    domain: string
    url: string
    title: string
    sec: number
}

interface commonSiteObj {
    name: string,
    domain: string,
    checked: boolean
}

interface domainsFormState {
    newDomains: Map<string, boolean>;
    domains: Map<string, boolean>;
    url: string;
    errors: object;
    commonSites: commonSiteObj[];
}

class NameForm extends React.Component<{}, domainsFormState> {
    defaultState: domainsFormState = {
        newDomains: new Map(), domains: new Map(), url: '', errors: {}, commonSites: [
            { name: "Youtube", domain: "www.youtube.com", checked: false },
            { name: "TikTok", domain: "www.tiktok.com", checked: false },
            { name: "Reddit", domain: "www.reddit.com", checked: false },
            { name: "Netflix", domain: "www.netflix.com", checked: false },
            { name: "GoogleDocs", domain: "docs.google.com", checked: false },
            { name: "Twitch", domain: "www.twitch.tv", checked: false },
            { name: "Youtube", domain: "twitter.com", checked: false },
            { name: "Twitter", domain: "www.facebook.com", checked: false },
            { name: "Gmail", domain: "mail.google.com", checked: false },
            { name: "Amazon", domain: "www.amazon.ca", checked: false },
        ]
    };
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = this.defaultState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addNewDomain = this.addNewDomain.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        document.addEventListener("DOMContentLoaded", () => {
            let element = document.getElementById("url") as HTMLInputElement;
            if (element.value !== '') {
                document.getElementById("url-label").classList.add('focused');
            }
            element.addEventListener('focus', function () {
                document.getElementById("url-label").classList.add('focused');
            })
            element.addEventListener('blur', function () {
                if (element.value === '') {
                    document.getElementById("url-label").classList.remove('focused');
                }
            })
        });
    }
    componentDidMount() {
        getVal("trackedDomains").then((oldDomains: string[]) => {
            const newState = { domains: new Map(oldDomains.map(obj => [obj, this.state.domains.get(obj) ? this.state.domains.get(obj) : false])) } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        });
    }
    componentDidUpdate() {
        getVal("trackedDomains").then((oldDomains: string[]) => {
            const newState = { domains: new Map(oldDomains.map(obj => [obj, this.state.domains.get(obj) ? this.state.domains.get(obj) : false])) } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        });
    }

    updateActuallyTrackedDomains(newDomains: Map<string, boolean>) {
        getVal("trackedDomains").then((domains: string[]) => {
            domains = domains.concat(Array.from(newDomains.keys()));
            setVal("trackedDomains", domains);
        })
    }

    validate(domain: string) {
        if (domain === "No Domain Found") {
            this.setState({ errors: { 'url': 'Invalid URL' } });
        } else if (!detectUnique(Array.from(this.state.newDomains.keys()), domain)) {
            this.setState({ errors: { 'url': 'This domain is already added to the \"About to Track\" list' } });
        } else if (!detectUnique(Array.from(this.state.domains.keys()), domain)) {
            this.setState({ errors: { 'url': 'You are already tracking this domain' } });
        } else {
            return true;
        }
        return false;
    }

    addNewDomain() {
        let domain: string = getDomain(this.state.url);
        if (this.validate(domain)) {
            let newDoms: Map<string, boolean> = this.state.newDomains;
            newDoms.set(domain, false);
            const newState = { newDomains: newDoms, url: '' } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        }
    }

    handleChange(event: { preventDefault: any, target: any }): void {
        const target = event.target;
        if (target.type === "checkbox") {
            if (target.name === "aboutToTrackDomainsCheckbox") {
                let newDoms: Map<string, boolean> = this.state.newDomains;
                newDoms.set(target.id, target.checked);
                this.setState({ newDomains: newDoms });
            } else if (target.name === "trackedDomainsCheckbox") {
                let newDoms: Map<string, boolean> = this.state.domains;
                newDoms.set(target.id, target.checked);
                this.setState({ domains: newDoms });
            } else {
                let value: boolean;
                value = target.checked;
                let newDoms: Map<string, boolean> = this.state.newDomains;
                if (value) {
                    let newDomain = this.state.commonSites[event.target.value].domain;
                    if (this.validate(newDomain)) {
                        newDoms.set(newDomain, false);
                    } else {
                        value = false;
                    }
                } else {
                    newDoms.delete(this.state.commonSites[event.target.value].domain);
                }
                let cs = this.state.commonSites;
                cs[event.target.value].checked = value;
                this.setState({ newDomains: newDoms, commonSites: cs });
            }
        } else {
            this.setState({ url: target.value });
        }
    }

    handleSubmit(event: { preventDefault: any, target: any }): void {
        event.preventDefault();
        if (this.state.newDomains.size === 0) {
            this.setState({ errors: { 'info': 'No new domains were added to your current tracked list' } });
        } else {
            console.log(Array.from(this.state.newDomains.keys()));
            this.updateActuallyTrackedDomains(this.state.newDomains);
            this.setState(this.defaultState);
            this.setState({ newDomains: new Map() });
            this.setState({ errors: { 'success': 'Currently tracked domains list updated!' } });
        }
    }

    handleDelete(event: { preventDefault: any, target: any }) {
        event.preventDefault();
        if (event.target.name === "aboutToTrackDomains") {
            this.setState({ newDomains: removeFalse(this.state.newDomains) });
            console.log(this.state.newDomains);
        } else {
            this.setState({ domains: removeFalse(this.state.domains) });
            setVal("trackedDomains", Array.from(this.state.domains.keys()));
        }
    }

    darkMode() {
        let cards = document.getElementsByClassName("card");
        for (let i: number = 0; i < cards.length; i++) {
            let element = cards[i] as HTMLElement;
            element.classList.add("bg-dark text-light border-white");
        }
        let headers = document.getElementsByClassName("card-header");
        for (let i: number = 0; i < headers.length; i++) {
            let element = headers[i] as HTMLElement;
            element.classList.add("border-white");
        }
        document.getElementsByTagName("body")[0].style.backgroundColor = "0f0f0f";
    }

    /*
        //How it works:
        //Every input in the form has a state, the inputs all have value = their state, so that the states are the "true value" of the form (checked for checkboxes)
        //When any input changes, a function is called to handle the corresponding change to the input's state
        //This way, when the for is submitted, the states are looked at to get the values from the input
    */

    render() {
        return (
            <div className='flex'>
                <CardGroup>
                    <Card style={{ width: "44rem" }} >
                        <Card.Header as="h5"><img width={20} height={20} src={require('../static/icon.png')} style={{ marginTop: '-0.2rem', marginRight: '0.2rem' }}></img> Timely - Website Tracking</Card.Header>
                        <Card.Body>
                            <Card.Text as="div">
                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Commonly Tracked Domains: </Form.Label><br></br>
                                        <Row>
                                            {this.state.commonSites.map((site, index) => (
                                                <div className="col-3" key={site.domain}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name={site.name}
                                                        id="default-checkbox1"
                                                        label={site.name}
                                                        checked={this.state.commonSites[index].checked}
                                                        aria-describedby="track${site}"
                                                        value={index}
                                                        onChange={this.handleChange}
                                                        inline
                                                    />
                                                    {index + 1 % 4 === 0 ? (<br></br>) : (null)}
                                                </div>
                                            ))}
                                        </Row>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3 g-1">
                                        {/* <InputGroup className="mb-3"> */}
                                        <Form.Label id="url-label" htmlFor="url"><span style={{ backgroundColor: "white" }}>Enter the URL of the website you would like to track:</span></Form.Label>
                                        <div style={{ width: '87%' }}>
                                            <Form.Control
                                                className="col-auto"
                                                type="text"
                                                name="url"
                                                id="url"
                                                aria-describedby="urlToTrack"
                                                value={this.state.url}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                        <Col>
                                            <Button variant="success" onClick={this.addNewDomain}>Add</Button>
                                        </Col>
                                        {/* </InputGroup> */}

                                        <Form.Text>We will convert your url to a domain, which we use to group websites by.</Form.Text>
                                    </Form.Group>
                                    <div className="message" style={{ color: "red" }}>{this.state.errors["url"]}</div>
                                    <div className="message" style={{ color: "green" }}>{this.state.errors["success"]}</div>
                                    <div className="message" style={{ color: "#2e8fa3" }}>{this.state.errors["info"]}</div>
                                    <Button variant="primary" type="submit" style={{ marginTop: '0.5rem' }}>Track Staged Domains</Button>
                                </Form>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header as="h5" style={{ height: '41px' }}></Card.Header>
                        <Card.Body>
                            <Row className="g-1">
                                <div className="col-6">
                                    <div className='fs-6 mb-2'>Currently Added/Staged Domains: </div>
                                    <Form onSubmit={this.handleDelete} className='ms-2' name="aboutToTrackDomains">
                                        {this.state.newDomains.size === 0 ? (
                                            <Form.Check disabled label="None" />
                                        ) : (
                                            <div>{
                                                [...this.state.newDomains.keys()].map((domain) => {
                                                    return <Form.Check
                                                        key={domain}
                                                        type="checkbox"
                                                        name="aboutToTrackDomainsCheckbox"
                                                        label={domain}
                                                        id={domain}
                                                        aria-describedby={"aboutToTrack" + domain}
                                                        checked={this.state.newDomains.get(domain)}
                                                        onChange={this.handleChange}
                                                    />
                                                })}
                                                < Button className="mt-3" variant="danger" type="submit" style={{ marginTop: '0.5rem' }}>Remove</Button>
                                            </div>
                                        )}
                                    </Form>
                                </div>
                                <div className="col-6">
                                    <div className='fs-6 mb-2'>Your Currently Tracked Domains: </div>
                                    <Form onSubmit={this.handleDelete} className='ms-2' name="trackedDomains">
                                        {this.state.domains.size === 0 ? (
                                            <Form.Check disabled label="None" />
                                        ) : (
                                            <div>
                                                {[...this.state.domains.keys()].map((domain) => {
                                                    return <Form.Check
                                                        key={domain}
                                                        type="checkbox"
                                                        name="trackedDomainsCheckbox"
                                                        label={domain}
                                                        id={domain}
                                                        aria-describedby={"aboutToTrack" + domain}
                                                        checked={this.state.domains.get(domain)}
                                                        onChange={this.handleChange}
                                                    />
                                                })}
                                                <div className='ms-auto'>
                                                    < Button className="mt-3" type="submit" variant="danger" style={{ marginTop: '0.5rem' }}>Remove</Button>
                                                </div>
                                            </div>
                                        )}
                                    </Form>
                                </div>
                            </Row>
                        </Card.Body>
                    </Card>
                </CardGroup >
            </div >
        )
    }
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<NameForm />, root)
