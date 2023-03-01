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
import { getDomain, removeItem, detectUnique } from '../utils/helper'

interface tabObj {
    id: number
    domain: string
    url: string
    title: string
    sec: number
}
interface domainsFormState {
    newDomains: string[];
    domains: string[];
    url: string;
    errors: object;
    Youtube: boolean;
    TikTok: boolean;
    Reddit: boolean;
    Netflix: boolean;
    GoogleDocs: boolean;
    Twitch: boolean;
    Twitter: boolean;
    Facebook: boolean;
    Gmail: boolean;
    Amazon: boolean
}

class NameForm extends React.Component<{}, domainsFormState> {
    commonSites: Map<string, string>
    defaultState: domainsFormState = {
        newDomains: [], domains: [], url: '', errors: {}, Youtube: false, TikTok: false, Reddit: false, Netflix: false, GoogleDocs: false,
        Twitch: false, Twitter: false, Facebook: false, Gmail: false, Amazon: false
    };
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = this.defaultState;
        this.commonSites = new Map([
            ["Youtube", "www.youtube.com"],
            ["TikTok", "www.tiktok.com	"],
            ["Reddit", "www.reddit.com"],
            ["Netflix", "www.netflix.com"],
            ["GoogleDocs", "docs.google.com"],
            ["Twitch", "www.twitch.tv"],
            ["Twitter", "twitter.com"],
            ["Facebook", "www.facebook.com"],
            ["Gmail", "mail.google.com"],
            ["Amazon", "www.amazon.ca"],
        ])

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addNewDomain = this.addNewDomain.bind(this);
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
            const newState = { domains: oldDomains } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        });
    }
    componentDidUpdate() {
        getVal("trackedDomains").then((oldDomains: string[]) => {
            const newState = { domains: oldDomains } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        });
    }

    updateDomains(newDomains: string[]) {
        getVal("trackedDomains").then((domains: string[]) => {
            domains = domains.concat(newDomains);
            setVal("trackedDomains", domains);
        })
    }

    validate(domain: string) {
        if (domain === "No Domain Found") {
            this.setState({ errors: { 'url': 'Invalid URL' } });
        } else if (!detectUnique(this.state.newDomains, domain)) {
            this.setState({ errors: { 'url': 'This domain is already added to the \"About to Track\" list' } });
        } else if (!detectUnique(this.state.domains, domain)) {
            this.setState({ errors: { 'url': 'You are already tracking this domain' } });
        } else {
            return true;
        }
        return false;
    }

    addNewDomain() {
        let domain: string = getDomain(this.state.url);
        if (this.validate(domain)) {
            let newDoms: string[] = this.state.newDomains;
            newDoms.push(domain);
            const newState = { newDomains: newDoms, url: '' } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        }
    }

    handleChange(event: { preventDefault: any, target: any }): void {
        const target = event.target;
        let value: any;
        if (target.type === 'checkbox') {
            value = target.checked;
            let newDoms: string[] = this.state.newDomains;
            if (value) {
                let newDomain = this.commonSites.get(target.name);
                if (this.validate(newDomain)) {
                    newDoms.push(newDomain);
                } else {
                    value = false;
                }
            } else {
                removeItem(newDoms, this.commonSites.get(target.name));
            }
            const newState = { newDomains: newDoms } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        } else {
            value = target.value;
        }
        const name: string = target.name;
        const newState = { [name]: value } as Pick<domainsFormState, keyof domainsFormState>;
        this.setState(newState);
    }

    handleSubmit(event: { preventDefault: any, target: any }): void {
        event.preventDefault();
        if (this.state.newDomains.length === 0) {
            this.setState({ errors: { 'info': 'No new domains were added to your current tracked list' } });
        } else {
            this.updateDomains(this.state.newDomains);
            this.setState(this.defaultState);
            this.setState({ newDomains: [] });
            this.setState({ errors: { 'success': 'Currently tracked domains list updated!' } });
        }
    }

    handleDelete(event: { preventDefault: any, target: any }) {

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
                                            {[...this.commonSites.keys()].map((site, index) => (
                                                <div className="col-3">
                                                    <Form.Check
                                                        key={site}
                                                        type="checkbox"
                                                        name={site}
                                                        id="default-checkbox"
                                                        label={site}
                                                        checked={this.state[site]}
                                                        aria-describedby="track${site}"
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
                                    <div style={{ color: "red", marginTop: '-0.5rem' }}>{this.state.errors["url"]}</div>
                                    <div style={{ color: "green", marginTop: '-0.5rem' }}>{this.state.errors["success"]}</div>
                                    <div style={{ color: "#2e8fa3", marginTop: '-0.5rem' }}>{this.state.errors["info"]}</div>
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
                                    <Form onSubmit={this.handleDelete} className='ms-2'>
                                        {this.state.newDomains.length === 0 ? (
                                            <Form.Check disabled label="None" />
                                        ) : (
                                            <div>{
                                                (this.state.newDomains).map((domain, index) => {
                                                    return <Form.Check
                                                        key={domain}
                                                        type="checkbox"
                                                        name={domain}
                                                        id="default-checkbox"
                                                        label={domain}
                                                        aria-describedby="aboutToTrack${domain}"
                                                    />
                                                })}
                                                < Button className="mt-3" variant="danger" type="submit" style={{ marginTop: '0.5rem' }}>Remove</Button>
                                            </div>
                                        )}
                                    </Form>
                                </div>
                                <div className="col-6">
                                    <div className='fs-6 mb-2'>Your Currently Tracked Domains: </div>
                                    <Form onSubmit={this.handleDelete} className='ms-2'>
                                        {this.state.domains.length === 0 ? (
                                            <Form.Check disabled label="None" />
                                        ) : (
                                            <div>
                                                {(this.state.domains).map((domain, index) => {
                                                    return <Form.Check
                                                        key={domain}
                                                        type="checkbox"
                                                        name={domain}
                                                        id="default-checkbox"
                                                        label={domain}
                                                        aria-describedby="currentlyTracked${domain}"
                                                    />
                                                })}
                                                <div className='ms-auto'>
                                                    < Button className="mt-3" variant="danger" type="submit" style={{ marginTop: '0.5rem' }}>Remove</Button>
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
