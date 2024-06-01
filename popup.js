document.addEventListener('DOMContentLoaded', () => {
   const form = document.getElementById("user-input");
   const alert_success = document.getElementById("alert-success");
   const storage = document.getElementById("storage-container");
   const editForm = document.getElementById("edit-form");
   const editButton = document.getElementById("edit-button");
   const cancelEditButton = document.getElementById("cancel-edit-button");

   storage.style.display = 'none';
   editForm.style.display = 'none';

   form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = [];
      const key = form.elements["quick-link-key"].value;
      const url = form.elements["quick-link-url"].value;
      data.push(key);
      data.push(url);
      chrome.runtime.sendMessage({ type: 'form_submission', data }, (response) => {
         console.log(response.message);
      });
      alert_success.style.display = 'block';
      document.getElementById("user-input").reset();
      storage.style.display = 'none';
      storage.innerHTML = "";
      getLinks.innerHTML = "View Links";
   });

   const getLinks = document.getElementById('get-links');
   getLinks.addEventListener('click', getQuickLinks);

   cancelEditButton.addEventListener('click', () => {
      editForm.style.display = 'none';
      storage.style.display = 'block';
   });


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
               const template = document.getElementById('link-template').content.cloneNode(true);
               const linkItem = template.querySelector('.link-item');
               template.querySelector('.link-key').textContent = key;
               template.querySelector('.link-url').textContent = result.redirect_link[key];

               const deleteButton = template.querySelector('.delete-button');
               deleteButton.addEventListener('click', () => deleteLink(key));
               deleteButton.addEventListener('mouseover', () => linkItem.classList.add('strike-through'));
               deleteButton.addEventListener('mouseout', () => linkItem.classList.remove('strike-through'));

               template.querySelector('.edit-button').addEventListener('click', () => showEditForm(key, result.redirect_link[key]));
               storage.appendChild(template);
            }
            storage.style.display = 'block';
         });
      }
   }

   function showEditForm(key, url) {
      storage.style.display = 'none';
      editForm.style.display = 'block';
      editForm.elements["edit-link-key"].value = key;
      editForm.elements["edit-link-url"].value = url;
      editButton.onclick = (event) => {
         event.preventDefault();
         editLink(key);
      };
   }

   function editLink(oldKey) {
      const newKey = editForm.elements["edit-link-key"].value;
      const newUrl = editForm.elements["edit-link-url"].value;
      if (newKey && newUrl) {
         chrome.runtime.sendMessage({
            type: 'edit_submission',
            oldKey: oldKey,
            newKey: newKey,
            newUrl: newUrl
         }, (response) => {
            console.log(response.message);
            editForm.style.display = 'none';
            storage.style.display = 'block';
            getQuickLinks();
         });
      }
   }

   function deleteLink(key) {
      chrome.runtime.sendMessage({
         type: 'delete_link',
         key: key
      }, (response) => {
         console.log(response.message);
         getQuickLinks();
      });
   }
});
