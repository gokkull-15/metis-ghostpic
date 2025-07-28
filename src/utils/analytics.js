import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (trackingId) => {
  // Initialize in all environments for testing
  ReactGA.initialize(trackingId, {
    debug: true,
    gaOptions: {
      debug_mode: true,
      send_page_view: false // We'll manually send the first page view
    }
  });
  console.log('GA initialized with ID:', trackingId);
};

// Log page views
export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path || window.location.pathname });
  console.log(`Page viewed: ${path || window.location.pathname}`);
};

// Log user events
export const logEvent = (category, action, label, value) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
  console.log(`Event: ${category} - ${action} - ${label} - ${value || 'N/A'}`);
};

// Log exceptions
export const logException = (description, fatal = false) => {
  ReactGA.exception({
    description,
    fatal,
  });
  console.log(`Exception: ${description}`);
};

// Track user timing
export const logTiming = (category, variable, value, label) => {
  ReactGA.timing({
    category,
    variable,
    value,
    label,
  });
  console.log(`Timing: ${category} - ${variable} - ${value}ms - ${label || 'N/A'}`);
};

// Set user properties
export const setUserProperties = (properties) => {
  ReactGA.set(properties);
  console.log('User properties set:', properties);
};
