let redirect_link = {};

// get all quick-links from storage
// store in `redirect_link` variable
chrome.storage.sync.get(['redirect_link'], (result) => {
  if (result.redirect_link !== undefined) {
    redirect_link = result.redirect_link;
  }
});

// event listener for omnibox input
// redirect to quick-link on enter
chrome.omnibox.onInputEntered.addListener((text) => {
  if (redirect_link[text] !== undefined) {
    chrome.tabs.update({ url: redirect_link[text] });
  } else {
    chrome.tabs.update({ url: "./error.html" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {

    // create a new quick-link item
    if (message.type === 'form_submission') {
      const data = message.data;
      const key = data[0];
      const url = data[1];
      redirect_link[key] = url;
      chrome.storage.sync.set({ redirect_link });
      sendResponse({ 
        success: true,
        message: "Q-link created successfully!" 
      });
    }
    
    // update a quick-link item
    else if (message.type === 'edit_submission') {
      delete redirect_link[message.old_keyword];
      redirect_link[message.new_keyword] = message.new_url;
      chrome.storage.sync.set({ redirect_link });
      sendResponse({ 
        success: true,
        message: "Q-link updated successfully!"
      });
    }

    // delete a quick-link item
    else if (message.type === 'delete_link') {
      delete redirect_link[message.key];
      chrome.storage.sync.set({ redirect_link });
      sendResponse({ 
        success: true,
        message: "Q-link deleted successfully!"
      });
    }

  } catch (error) {
    sendResponse({ 
      success: false,
      message: "Error: " + error.message
    });
  }
});
