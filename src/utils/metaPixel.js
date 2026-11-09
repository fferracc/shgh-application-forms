export const trackMetaEvent = (eventName, eventParams = {}) => {
  try {
    const fb = window.fbq || (typeof window !== 'undefined' && window.fbq);
    if (typeof fb === 'function') {
      const urlParams = new URLSearchParams(window.location.search);
      const testCode = urlParams.get('fb_test_event_code') || urlParams.get('test_event_code');
      if (testCode) {
        fb('set', 'testEventCode', testCode);
      }
      fb('track', eventName, eventParams);
      console.log(`[Meta Pixel] Tracked ${eventName}:`, eventParams);
    } else {
      console.warn(`[Meta Pixel] fbq function not found when trying to track ${eventName}`);
    }
  } catch (err) {
    console.error(`[Meta Pixel] Error tracking ${eventName}:`, err);
  }
};
