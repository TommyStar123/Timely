import React from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';
import { InputGroup, Row } from 'react-bootstrap'
import './options.css'

import { getVal, setVal } from '../utils/storage'
import { getDomain, removeFalse, removeItem, detectUnique } from '../utils/helper'

interface tabObj {
    id: number
    domain: string
    url: string
    title: string
    sec: number
    icon: string
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
    darkMode: boolean;
    trackAll: boolean;
}

class TrackForm extends React.Component<{}, domainsFormState> {
    commonSites: commonSiteObj[] = [
        { name: "Youtube", domain: "www.youtube.com", checked: false },
        { name: "TikTok", domain: "www.tiktok.com", checked: false },
        { name: "Reddit", domain: "www.reddit.com", checked: false },
        { name: "Netflix", domain: "www.netflix.com", checked: false },
        { name: "GoogleDocs", domain: "docs.google.com", checked: false },
        { name: "Twitch", domain: "www.twitch.tv", checked: false },
        { name: "Facebook", domain: "www.facebook.com", checked: false },
        { name: "Twitter", domain: "twitter.com", checked: false },
        { name: "Gmail", domain: "mail.google.com", checked: false },
        { name: "Amazon", domain: "www.amazon.ca", checked: false },
    ];
    defaultState: domainsFormState = {
        newDomains: new Map(), domains: new Map(), url: '', errors: {}, commonSites: this.commonSites, darkMode: false, trackAll: false
    };
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = this.defaultState;
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addNewDomain = this.addNewDomain.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.darkMode = this.darkMode.bind(this);
        this.trackItAll = this.trackItAll.bind(this);

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
        getVal("trackAll").then((trackAll: boolean) => {
            this.setState({ trackAll: trackAll });
            if (trackAll) {
                getVal("allTabs").then((allTabs: tabObj[]) => {
                    let trackedTabs = new Map<string, boolean>;
                    allTabs.forEach((tab) => {
                        trackedTabs.set(tab.domain, false);
                    });
                })
            }
        })
        getVal("darkMode").then((darkMode: boolean) => {
            this.setState({ darkMode: darkMode });
            this.setDarkLight(darkMode);
        })
    }

    // componentDidUpdate() {
    //     getVal("trackedDomains").then((oldDomains: string[]) => {
    //         const newState = { domains: new Map(oldDomains.map(obj => [obj, this.state.domains.get(obj) ? this.state.domains.get(obj) : false])) } as Pick<domainsFormState, keyof domainsFormState>;
    //         this.setState(newState);
    //     });
    // }

    updateActuallyTrackedDomains(newDomains: Map<string, boolean>) {
        getVal("trackedDomains").then((domains: string[]) => {
            domains = domains.concat(Array.from(newDomains.keys()));
            setVal("trackedDomains", domains);
        })
    }

    validate(domain: string) {
        if (domain === "No Domain Found") {
            this.setState({ errors: { 'url': '*Invalid URL' } });
        } else if (!detectUnique(Array.from(this.state.newDomains.keys()), domain)) {
            this.setState({ errors: { 'url': '*This domain is already added to the \"About to Track\" list' } });
        } else if (!detectUnique(Array.from(this.state.domains.keys()), domain)) {
            this.setState({ errors: { 'url': '*You are already tracking this domain' } });
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
            this.setState({ errors: { 'info': '*No new domains were added to your current tracked list' } });
        } else {
            let newDoms = this.state.newDomains;
            this.updateActuallyTrackedDomains(newDoms);
            this.setState(this.defaultState);
            this.setState({ newDomains: new Map() });
            this.setState({ domains: new Map([...this.state.domains, ...newDoms]) });
            this.setState({ errors: { 'success': 'Currently tracked domains list updated!' } });
            let commonSites = this.state.commonSites;
            for (let obj of commonSites) {
                obj.checked = false;
            }
            this.setState({ commonSites: commonSites });
        }
    }

    handleDelete(event: { preventDefault: any, target: any }): void {
        event.preventDefault();
        if (event.target.name === "aboutToTrackDomains") {
            let newDoms = this.state.newDomains;
            let commonSites = this.commonSites;
            let commonDomains: string[] = [];
            for (let i = 0; i < commonSites.length; i++) {
                commonDomains.push(commonSites[i].domain);
            }
            for (let [key, value] of newDoms.entries()) {
                let index = commonDomains.indexOf(key)
                if (value) {
                    newDoms.delete(key);
                    if (index > -1) {
                        commonSites[index].checked = false;
                    }
                }
            }
            this.setState({ newDomains: newDoms });
            this.setState({ commonSites: commonSites });
        } else {
            let trackedDomains = Array.from(this.state.domains.keys())
            let trackedDomainsMap = this.state.domains;
            setVal("trackedDomains", trackedDomains);
            getVal("allTabs").then((allTabs: tabObj[]) => {
                allTabs.forEach((tab: { domain: string }, index) => {
                    if (!detectUnique(trackedDomains, tab.domain) && trackedDomainsMap.get(tab.domain)) {
                        allTabs.splice(index, 1);
                    }
                })
                setVal("allTabs", allTabs);
                trackedDomainsMap = removeFalse(this.state.domains);
                this.setState({ domains: trackedDomainsMap });
                setVal("trackedDomains", Array.from(trackedDomainsMap.keys()));
            });
        }
    }

    darkMode(event: { preventDefault: any, target: any }): void {
        let val = event.target.checked;
        this.setState({ darkMode: val });
        setVal("darkMode", val);
        this.setDarkLight(val);
    }

    trackItAll(event: { preventDefault: any, target: any }) {
        let val = event.target.checked;
        this.setState({ trackAll: val });
        setVal("trackAll", val);
    }

    setDarkLight(val: boolean) {
        if (val) {
            let cards = document.getElementsByClassName("card");
            for (let i: number = 0; i < cards.length; i++) {
                let element = cards[i] as HTMLElement;
                element.classList.add("bg-dark");
                element.classList.add("text-light");
                element.classList.add("border-white");
            }
            let headers = document.getElementsByClassName("card-header");
            for (let i: number = 0; i < headers.length; i++) {
                let element = headers[i] as HTMLElement;
                element.classList.add("border-white");
            }
            document.getElementsByTagName("body")[0].style.backgroundColor = "#0f0f0f";
        } else {
            let cards = document.getElementsByClassName("card");
            for (let i: number = 0; i < cards.length; i++) {
                let element = cards[i] as HTMLElement;
                element.classList.remove("bg-dark");
                element.classList.remove("text-light");
                element.classList.remove("border-white");
            }
            let headers = document.getElementsByClassName("card-header");
            for (let i: number = 0; i < headers.length; i++) {
                let element = headers[i] as HTMLElement;
                element.classList.remove("border-white");
            }
            document.getElementsByTagName("body")[0].style.backgroundColor = "white";
        }
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
                        <Card.Header as="h5" className="py-3">
                            <img width={22} height={22} src={require('../static/icon.png')} style={{ marginTop: '-0.25rem', marginRight: "0.18rem" }}></img> Timely - Website Tracking
                            <Form.Check style={{ float: "right", marginTop: "0.4rem" }}
                                className="fs-6"
                                type="switch"
                                id="custom-switch"
                                label="Dark Mode"
                                onChange={this.darkMode}
                                checked={this.state.darkMode}
                                reverse
                            />
                        </Card.Header>
                        <Card.Body>
                            <Card.Text as="div">
                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Label>Commonly Tracked Domains: </Form.Label><br></br>
                                    <Row style={{ marginBottom: "-0.5rem" }}>
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
                                    <Form.Label id="url-label" htmlFor="url">Enter a Website URL to Track</Form.Label>
                                    <InputGroup className='mb-1'>
                                        <Form.Control
                                            className="col-auto"
                                            type="text"
                                            name="url"
                                            id="url"
                                            aria-describedby="urlToTrack"
                                            value={this.state.url}
                                            onChange={this.handleChange}
                                        />
                                        <Button className="px-3" variant="success" onClick={this.addNewDomain}>Add</Button>
                                    </InputGroup>
                                    <Form.Text className="description">We will convert your url to a domain, which we use to group websites by.</Form.Text>
                                    <div className="message mt-1" style={{ color: "red" }}>{this.state.errors["url"]}</div>
                                    <div className="message" style={{ color: "green" }}>{this.state.errors["success"]}</div>
                                    <div className="message mb-1" style={{ color: "rgb(33 135 207)" }}>{this.state.errors["info"]}</div>
                                    <Button variant="primary" type="submit" style={{ marginTop: '0.7rem', marginBottom: '0.1rem' }}>Track Staged Domains</Button>
                                </Form>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header as="h5" style={{ height: "4.05rem" }} >
                            <Form.Check style={{ float: "right", marginTop: "0.9rem" }}
                                className="remove fs-6"
                                type="checkbox"
                                label="Just Track Everything Bro"
                                onChange={this.trackItAll}
                                checked={this.state.trackAll}
                                aria-describedby={"trackItAll"}
                            />
                        </Card.Header>
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
                                                        className="staged"
                                                        type="checkbox"
                                                        name="aboutToTrackDomainsCheckbox"
                                                        label={domain}
                                                        id={domain}
                                                        aria-describedby={"aboutToTrack" + domain}
                                                        checked={this.state.newDomains.get(domain)}
                                                        onChange={this.handleChange}
                                                    />
                                                })}
                                                < Button className="mt-3 text-light" type="submit" style={{ marginTop: '0.5rem', backgroundColor: "#029fbf", borderColor: "#029fbf" }}>Remove</Button>
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
                                                        className="remove"
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
                                            </div>)}
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
ReactDOM.render(<TrackForm />, root)