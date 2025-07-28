import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (trackingId) => {
  // Only initialize in production environment
  if (import.meta.env.PROD) {
    ReactGA.initialize(trackingId);
    console.log('GA initialized');
  }
};

// Log page views
export const logPageView = (path) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: "pageview", page: path || window.location.pathname });
    console.log(`Page viewed: ${path || window.location.pathname}`);
  }
};

// Log user events
export const logEvent = (category, action, label, value) => {
  if (import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log(`Event: ${category} - ${action} - ${label} - ${value || 'N/A'}`);
  }
};

// Log exceptions
export const logException = (description, fatal = false) => {
  if (import.meta.env.PROD) {
    ReactGA.exception({
      description,
      fatal,
    });
    console.log(`Exception: ${description}`);
  }
};

// Track user timing
export const logTiming = (category, variable, value, label) => {
  if (import.meta.env.PROD) {
    ReactGA.timing({
      category,
      variable,
      value,
      label,
    });
    console.log(`Timing: ${category} - ${variable} - ${value}ms - ${label || 'N/A'}`);
  }
};

// Set user properties
export const setUserProperties = (properties) => {
  if (import.meta.env.PROD) {
    ReactGA.set(properties);
    console.log('User properties set:', properties);
  }
};
