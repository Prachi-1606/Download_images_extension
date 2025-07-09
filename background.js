chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadImages' && Array.isArray(request.images)) {
    request.images.forEach((url, idx) => {
      chrome.downloads.download({
        url: url,
        filename: `image_${idx + 1}${getExtension(url)}`,
        conflictAction: 'uniquify'
      });
    });
  }
});

function getExtension(url) {
  const match = url.match(/\.\w{3,4}(?=($|\?|#))/);
  return match ? match[0] : '.jpg';
} 