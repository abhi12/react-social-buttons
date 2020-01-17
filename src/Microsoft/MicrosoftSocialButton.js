import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { UserAgentApplication } from 'msal';
import config from './Config';
import { getEvents } from './GraphService';

import '../social.scss';

class MicrosoftSocialButton extends Component {
  static propTypes = {
    callbackFn: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getCalendarEvents = this.getCalendarEvents.bind(this);

    this.userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: config.appId
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
      }
    });

    var user = this.userAgentApplication.getAccount();

    this.state = {
      isAuthenticated: (user !== null),
      events: [],
      error: null
    };

    if (user) {
      this.getCalendarEvents();
    }
  }

  render() {
    const { isAuthenticated } = this.state;
    return (
      <div
        aria-label="Login with Microsoft"
        className="social-button"
        onClick={isAuthenticated ? this.logout : this.login}
      >
        <img
          alt="Login with Microsoft"
          className="suggest-icon"
          src="https://app.leadr.com/assets/svg/microsoft.svg"
        />
        <span className="social-button-text">{!isAuthenticated ? 'Connect' : 'Disconnect'} Microsoft Calendar</span>
        <div>&nbsp;</div>
      </div>
    );
  }

  async login() {
    try {
      await this.userAgentApplication.loginPopup(
        {
          scopes: config.scopes,
          prompt: "select_account"
        });
      await this.getCalendarEvents();
    }
    catch (err) {
      var error = {};

      if (typeof (err) === 'string') {
        var errParts = err.split('|');
        error = errParts.length > 1 ?
          { message: errParts[1], debug: errParts[0] } :
          { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }

      this.setState({
        isAuthenticated: false,
        error: error
      });
    }
  }

  logout() {
    this.userAgentApplication.logout();
  }

  async getCalendarEvents() {
    try {
      // Get the access token
      var accessToken = await this.userAgentApplication.acquireTokenSilent({
        scopes: config.scopes
      });

      if (accessToken) {
        // Get the user's events
        var events = await getEvents(accessToken);
        // Update the array of events in state
        this.setState({
          isAuthenticated: true,
          error: null,
          events: events.value
        });

        this.props.callbackFn(events.value);
      }
    }
    catch (err) {
      var error = {};
      if (typeof (err) === 'string') {
        var errParts = err.split('|');
        error = errParts.length > 1 ?
          { message: errParts[1], debug: errParts[0] } :
          { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err)
        };
      }

      this.setState({
        isAuthenticated: false,
        error: error
      });
    }
  }
}

export default MicrosoftSocialButton;
