let redirect_link = {}
chrome.storage.sync.get(['redirect_link'], (result) => {
  if (result.redirect_link !== undefined) {
    redirect_link = result.redirect_link;
  }
});

chrome.omnibox.onInputEntered.addListener((text) => {
  if (redirect_link[text] !== undefined){
    chrome.tabs.update({url: redirect_link[text]});
  } else {
    chrome.tabs.update({url: "./error.html"});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'form_submission') {
    const data = message.data;
    const key = data[0];
    const url = data[1];
    redirect_link[key] = url;
    chrome.storage.sync.set({redirect_link});
    sendResponse({ message: "Form submitted successfully!" });
  }
});