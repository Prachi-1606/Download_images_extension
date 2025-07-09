chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getImages') {
    const images = Array.from(document.images)
      .map(img => img.src)
      .filter(src => src && src.startsWith('http'));
    sendResponse({images});
  }
  return true;
}); 