// Request image URLs from the content script
function getImagesFromTab(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content.js']
    }, function() {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getImages'}, function(response) {
        callback(response ? response.images : []);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const imagesDiv = document.getElementById('images');
  const downloadBtn = document.getElementById('downloadBtn');
  const selectAllCheckbox = document.getElementById('selectAll');
  let imageUrls = [];
  let selected = new Set();

  function renderImages(images) {
    imagesDiv.innerHTML = '';
    images.forEach((url, idx) => {
      const container = document.createElement('div');
      container.className = 'img-container';
      const img = document.createElement('img');
      img.src = url;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'img-checkbox';
      checkbox.checked = true;
      checkbox.dataset.idx = idx;
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          selected.add(idx);
        } else {
          selected.delete(idx);
        }
        updateSelectAll();
        updateButtonState();
      });
      container.appendChild(img);
      container.appendChild(checkbox);
      imagesDiv.appendChild(container);
      selected.add(idx);
    });
    updateButtonState();
  }

  function updateSelectAll() {
    selectAllCheckbox.checked = selected.size === imageUrls.length && imageUrls.length > 0;
    selectAllCheckbox.indeterminate = selected.size > 0 && selected.size < imageUrls.length;
  }

  function updateButtonState() {
    downloadBtn.disabled = selected.size === 0;
  }

  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = imagesDiv.querySelectorAll('.img-checkbox');
    if (this.checked) {
      checkboxes.forEach((cb, idx) => {
        cb.checked = true;
        selected.add(idx);
      });
    } else {
      checkboxes.forEach((cb, idx) => {
        cb.checked = false;
        selected.delete(idx);
      });
    }
    updateSelectAll();
    updateButtonState();
  });

  getImagesFromTab(function(images) {
    imageUrls = images;
    selected = new Set(images.map((_, idx) => idx));
    renderImages(images);
    updateSelectAll();
  });

  downloadBtn.addEventListener('click', function() {
    const toDownload = Array.from(selected).map(idx => imageUrls[idx]);
    chrome.runtime.sendMessage({action: 'downloadImages', images: toDownload});
  });
}); 