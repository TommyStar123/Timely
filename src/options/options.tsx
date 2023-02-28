import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Col, Row } from 'react-bootstrap'
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

class NameForm extends React.Component <{}, domainsFormState> {
    commonSites: Map<string, string>
    defaultState:domainsFormState = {newDomains: [], domains: [], url: '', errors: {}, Youtube: false, TikTok: false, Reddit: false, Netflix: false, GoogleDocs: false, 
                       Twitch: false, Twitter:false, Facebook:false, Gmail: false, Amazon: false};
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

    updateDomains(newDomains: string[]){
        getVal("trackedDomains").then((domains: string[]) => {
            domains = domains.concat(newDomains);
            setVal("trackedDomains", domains);
        })
    }

    validate(domain: string){
        if(domain === "No Domain Found"){
            this.setState({ errors: {'url': 'Invalid URL'} });
        } else if(!detectUnique(this.state.newDomains, domain)){
            this.setState({ errors: {'url': 'This domain is already added to the \"About to Track\" list'} });
        } else if(!detectUnique(this.state.domains, domain)){
            this.setState({ errors: {'url': 'You are already tracking this domain'} });
        } else{
            return true;
        }
        return false;
    }

    addNewDomain(){
        let domain:string = getDomain(this.state.url);
        if(this.validate(domain)){ 
            let newDoms:string[] = this.state.newDomains;
            newDoms.push(domain);
            const newState = { newDomains: newDoms, url: '' } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        }
    }

    handleChange(event: { preventDefault: any, target: any }) {
        const target = event.target;
        let value: any;
        if(target.type === 'checkbox'){
            value = target.checked;
            let newDoms:string[] = this.state.newDomains;
            if(value){
                let newDomain = this.commonSites.get(target.name);
                if(this.validate(newDomain)){ 
                    newDoms.push(newDomain);
                } else{
                    value = false;
                }
            } else{
                removeItem(newDoms, this.commonSites.get(target.name));
            }
            const newState = { newDomains: newDoms } as Pick<domainsFormState, keyof domainsFormState>;
            this.setState(newState);
        }else{
            value = target.value;
        }
        const name: string = target.name;
        const newState = { [name]: value } as Pick<domainsFormState, keyof domainsFormState>;
        this.setState(newState);
    }

    handleSubmit(event: { preventDefault: any, target: any}) {
        event.preventDefault();
        if(this.state.newDomains.length === 0){
            this.setState({ errors: {'info': 'No new domains were added to your current tracked list'} });
        } else{
            this.updateDomains(this.state.newDomains);
            this.setState(this.defaultState);
            this.setState({ newDomains: [] });
            this.setState({ errors: {'success': 'Currently tracked domains list updated!'} });
        }
    }
    render(){
        return(
            <div className='flex'>
                <CardGroup>
                <Card style={{ width: "44rem"}}>
                    <Card.Header as="h5"><img width={20} height={20} src={require('../static/icon.png')} style={{ marginTop: '-0.2rem', marginRight: '0.2rem'}}></img> Timely - Website Tracking</Card.Header>
                    <Card.Body>
                        <Card.Text as="div">
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Commonly Tracked Domains: </Form.Label>
                                    {[...this.commonSites.keys()].map((site) => (
                                        // <div  className="mb-2">
                                            <Form.Check 
                                                key={site}
                                                type="checkbox"
                                                name={site}
                                                id="default-checkbox"
                                                label={site}
                                                checked={this.state[site]} 
                                                aria-describedby="track${site}"
                                                onChange={this.handleChange}
                                            />
                                        // </div>
                                    ))}
                                </Form.Group>
                                <Form.Label htmlFor="url">Enter the URL of the website you would like to track:</Form.Label>
                                <Form.Group as={Row} className="mb-3 g-1"> 
                                    <div style={{width: '87%'}}>
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
                                    <Form.Text>We will convert your url to a domain, which we use to group websites by.</Form.Text>
                                </Form.Group>
                                <div style={{ color: "red", marginTop:'-0.5rem' }}>{this.state.errors["url"]}</div>
                                <div style={{ color: "green", marginTop:'-0.5rem' }}>{this.state.errors["success"]}</div>
                                <div style={{ color: "#2e8fa3", marginTop:'-0.5rem' }}>{this.state.errors["info"]}</div>
                                <Button variant="primary" type="submit" style={{ marginTop: '0.5rem' }}>Submit</Button>
                            </Form>
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header as="h5" style={{height: '41px'}}></Card.Header>
                    <Card.Body>
                        <div className='fs-6 mb-2'>Domains You Are About to Track: </div>
                        <ul>
                            {this.state.newDomains.length === 0 ? (
                                <li>None</li>
                            ) : (
                                (this.state.newDomains).map((domain, index) => {
                                    return <li key={domain}>{domain}</li>
                                })
                            )}
                        </ul>
                        <div className='fs-6 mb-2'>Your Currently Tracked Domains: </div>
                        <ul>
                            {this.state.domains.length === 0 ? (
                                <li>None</li>
                            ) : (
                                (this.state.domains).map((domain, index) => {
                                    return <li key={domain}>{domain}</li>
                                })
                            )}
                        </ul>
                    </Card.Body>
                </Card>
                </CardGroup>
            </div>
        )
    }
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<NameForm />, root)
