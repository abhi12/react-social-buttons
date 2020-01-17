import React, { Component } from "react";
import PropTypes from "prop-types";

import { CLIENT_ID, DISCOVERY_DOCS, SCOPES, apiKey } from "./Config";

import "../social.scss";

class GoogleSocialButton extends Component {
    static propTypes = {
        callbackFn: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.state = {
            showAuthButton: true,
            showSignOutButton: false,
            events: []
        };
        this.initClient = this.initClient.bind(this);
        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.listUpcomingEvents = this.listUpcomingEvents.bind(this);

        this.handleClientLoad();
    }

    handleAuthClick() {
        window.gapi.auth2.getAuthInstance().signIn();
    }

    handleSignoutClick() {
        window.gapi.auth2.getAuthInstance().signOut();
    }

    handleClientLoad() {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        document.body.appendChild(script);
        script.onload = () => {
            window.gapi.load('client:auth2', this.initClient);
        };
    }

    initClient() {
        window.gapi.client.init({
            apiKey,
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        }).then(() => {
            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

            // Handle the initial sign-in state.
            this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        });
    }

    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            this.setState({
                showAuthButton: false,
                showSignOutButton: true
            })
            this.listUpcomingEvents(1000)
                .then(({ result }) => {
                    this.setState({
                        events: result.items
                    })
                    this.props.callbackFn(result.items)
                })
        } else {
            this.setState({
                showAuthButton: true,
                showSignOutButton: false
            })
        }
    }

    listUpcomingEvents(maxResults, calendarId = "primary") {
        if (window.gapi) {
            return window.gapi.client.calendar.events.list({
                'calendarId': calendarId,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': maxResults,
                'orderBy': 'startTime'
            });
        }
        else {
            console.log("Error: this.gapi not loaded");
            return false;
        }
    }

    renderSignoutBtn() {
        return (
            <div
                aria-label="Login with google"
                className="social-button"
                onClick={this.handleSignoutClick.bind(this)}
            >
                <img
                    alt="Login with google"
                    className="suggest-icon"
                    src="https://app.leadr.com/assets/svg/google.svg"
                />
                <span className="social-button-text">Disconnect Google Calendar</span>
                <div>&nbsp;</div>
            </div>
        );
    }

    renderAuthBtn() {
        return (
            <div
                aria-label="Login with google"
                className="social-button"
                onClick={this.handleAuthClick.bind(this)}
            >
                <img
                    alt="Login with google"
                    className="suggest-icon"
                    src="https://app.leadr.com/assets/svg/google.svg"
                />
                <span className="social-button-text">Connect Google Calendar</span>
                <div>&nbsp;</div>
            </div>
        );
    }

    render() {
        if (this.state.showAuthButton) {
            return this.renderAuthBtn();
        } else if (this.state.showSignOutButton) {
            return this.renderSignoutBtn();
        }
        return null;
    }
}

export default GoogleSocialButton;
