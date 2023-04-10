const form = document.getElementById("user-input");
const alert_success = document.getElementById("alert-success");
const alert_error = document.getElementById("alert-error");
const storage = document.getElementById("storage-container");
storage.style.display = 'none';

form.addEventListener("submit", (event) => {
   event.preventDefault();
   const data = [];
   const key = form.elements["quick-link-key"].value;
   const url = form.elements["quick-link-url"].value;
   data.push(key);
   data.push(url);
   chrome.runtime.sendMessage({ type: 'form_submission', data } , (response) => {
      console.log(response.message);
   });
   alert_success.style.display = 'block';
   document.getElementById("user-input").reset();
   storage.style.display = 'none';
   storage.innerHTML = "";
});

const getLinks = document.getElementById('get-links');
getLinks.addEventListener('click', getQuickLinks);


function getQuickLinks() {
   if (getLinks.innerHTML == "Hide Links") {
      getLinks.innerHTML = "View Links";
      storage.style.display != 'none';
      storage.innerHTML = "";
   } else {
      getLinks.innerHTML = "Hide Links";
      chrome.storage.sync.get(['redirect_link'], (result) => {
         if (storage.style.display != 'none') {
            storage.innerHTML = "";
         }
         for (let key in result.redirect_link) {
            const link = document.createElement('p');
            const bold = document.createElement('span');
            const breakLine = document.createElement('br');
            bold.textContent = key;
            link.textContent = result.redirect_link[key];
            link.prepend(breakLine);
            link.prepend(bold);
            storage.appendChild(link);
         }
         storage.style.display = 'block';
      });
   }
}