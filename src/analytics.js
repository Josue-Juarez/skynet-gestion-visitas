import ReactGA from "react-ga4";

export const initAnalytics = () => {
  ReactGA.initialize("G-KW92NL701C");
};

export const trackEvent = (eventName, eventParams = {}) => {
  ReactGA.event(eventName, eventParams);
};
