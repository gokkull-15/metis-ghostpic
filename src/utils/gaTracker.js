// Direct GA4 implementation

export const trackPageView = () => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Tracking page view via gtag');
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        send_to: 'G-Q85PTV01ZG'
      });
      return true;
    } else {
      console.error('gtag not available');
      return false;
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
};

export const trackEvent = (action, category, label, value) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log(`Tracking event via gtag: ${action}, ${category}, ${label}`);
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        send_to: 'G-Q85PTV01ZG'
      });
      return true;
    } else {
      console.error('gtag not available');
      return false;
    }
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
};

export const checkTrackingAvailable = () => {
  // Check if cookies are enabled
  const cookiesEnabled = navigator.cookieEnabled;
  
  // Check if GA script is loaded
  const gaScriptLoaded = Array.from(document.scripts).some(
    script => script.src && script.src.includes('googletagmanager')
  );
  
  // Check if gtag function is available
  const gtagAvailable = typeof window.gtag === 'function';
  
  console.log({
    cookiesEnabled,
    gaScriptLoaded,
    gtagAvailable
  });
  
  return cookiesEnabled && gaScriptLoaded && gtagAvailable;
};

// This function sends a ping to verify Google Analytics is working
export const sendTestEvent = () => {
  const timestamp = new Date().getTime();
  trackEvent('test_ping', 'Debug', `Test at ${timestamp}`, timestamp);
  
  // Create a DOM element to visualize the ping in the console
  const debugElement = document.createElement('div');
  debugElement.style.display = 'none';
  debugElement.id = `ga-debug-${timestamp}`;
  debugElement.textContent = `GA test ping sent at ${timestamp}`;
  document.body.appendChild(debugElement);
  
  console.log(`GA test ping sent at ${timestamp}`);
  
  return timestamp;
};
