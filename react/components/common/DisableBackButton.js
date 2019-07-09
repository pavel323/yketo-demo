import React from 'react';
import Router from 'next/router';

/**
 * Disables the browser back button on a page where it's injected. The sale funnel isn't designed
 * for using the back button so this component may be helpful.
 *
 * The solution is based on the https://stackoverflow.com/a/34337617/1118709 note
 */
export class DisableBackButton extends React.PureComponent {
  componentDidMount() {
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', this.handlePopHistoryState);

    // Disables the Next.js back button handling
    Router.beforePopState(() => false);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopHistoryState);
    Router.beforePopState(() => {});
  }

  handlePopHistoryState = () => {
    window.history.pushState(null, document.title, window.location.href);
  };

  render() {
    return null;
  }
}
