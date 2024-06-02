document.addEventListener('DOMContentLoaded', () => {

   // homepage items
   const form_add = document.getElementById("user-input");
   const div_alert_success = document.getElementById("alert-success");
   const div_alert_error = document.getElementById("alert-error");
   const div_storage = document.getElementById("storage-container");
   const button_view_links = document.getElementById('get-links');
   
   // edit form items
   const form_edit = document.getElementById("edit-form");
   const button_edit_save = document.getElementById("save-edit-button");
   const button_edit_cancel = document.getElementById("cancel-edit-button");

   // list of links and edit form are hidden on load
   div_storage.style.display = 'none';
   form_edit.style.display = 'none';

   // event listener for form submission
   // create a new quick link
   form_add.addEventListener("submit", (event) => {
      event.preventDefault();
      
      // data for a new quick-link item
      const data = [
         form_add.elements["quick-link-key"].value,  // keyword
         form_add.elements["quick-link-url"].value   // url
      ];

      // send message to background.js
      chrome.runtime.sendMessage({ type: 'form_submission', data }, (response) => {

         // display success or error message depending
         // on response from background.js
         if (response.success) {
            div_alert_error.style.display = 'none';                      // hide error message
            div_alert_success.innerHTML = `<p>${response.message}</p>`;  // insert success message
            div_alert_success.style.display = 'block';                   // display success message
            form_add.reset();                                            // clear form

         } else {
            div_alert_success.style.display = 'none';                    // hide success message
            div_alert_error.innerHTML = `<p>${response.message}</p>`;    // insert error message
            div_alert_error.style.display = 'block';                     // display error message
            form_add.reset();                                            // clear form
         }
      });

      div_storage.style.display = 'none';           // hide list of links in case visible
      div_storage.innerHTML = "";                   // reset list of links
      button_view_links.innerHTML = "View Links";   // reset button text
   });
   
   // event listener for button click
   // display a list of all stored quick-links
   button_view_links.addEventListener('click', getQuickLinks);

   // event listener for cancel button in edit form
   // hide edit form and display list of links
   button_edit_cancel.addEventListener('click', () => {
      form_edit.style.display = 'none';
      div_storage.style.display = 'block';
   });

   // function to get all quick-links from storage
   function getQuickLinks() {

      // if button text is "Hide Links", hide list of links
      if (button_view_links.innerHTML == "Hide Links") {
         button_view_links.innerHTML = "View Links";
         div_storage.style.display != 'none';
         div_storage.innerHTML = "";
      }

      // if button text is "View Links", display list of links
      else {
         button_view_links.innerHTML = "Hide Links";
         chrome.storage.sync.get(['redirect_link'], (result) => {
            if (div_storage.style.display != 'none') {
               div_storage.innerHTML = "";
            }

            if (result.redirect_link === undefined || Object.keys(result.redirect_link).length == 0) {
               div_storage.innerHTML = "<p><small>Empty</small></p>";
            
            } else {
               // create a new link item for each quick-link
               for (let key in result.redirect_link) {
                  const template = document.getElementById('link-template').content.cloneNode(true);
                  const link_item = template.querySelector('.link-item');
                  template.querySelector('.link-key').textContent = key;
                  template.querySelector('.link-url').textContent = result.redirect_link[key];

                  // delete quick-link on delete button click
                  const button_delete = template.querySelector('.delete-button');
                  button_delete.addEventListener('click', () => deleteLink(key));

                  // add strike-through effect on delete button hover
                  button_delete.addEventListener('mouseover', () => link_item.classList.add('strike-through'));
                  button_delete.addEventListener('mouseout', () => link_item.classList.remove('strike-through'));

                  // add edit form to div on edit button click
                  template.querySelector('.edit-button').addEventListener('click', () => showEditForm(key, result.redirect_link[key]));
                  div_storage.appendChild(template);
               }
            }

            // display list of links
            div_storage.style.display = 'block';
         });
      }
   }

   // function to show edit form
   function showEditForm(key, url) {
      div_storage.style.display = 'none';
      form_edit.style.display = 'block';
      form_edit.elements["edit-link-key"].value = key;
      form_edit.elements["edit-link-url"].value = url;
      button_edit_save.onclick = (event) => {
         event.preventDefault();
         editLink(key);
      };
   }

   // function to edit a quick-link
   function editLink(old_keyword) {
      const new_keyword = form_edit.elements["edit-link-key"].value;
      const new_url = form_edit.elements["edit-link-url"].value;
      
      if (new_keyword && new_url) {

         // send message to background.js to update quick-link item
         chrome.runtime.sendMessage({
            type: 'edit_submission',
            old_keyword: old_keyword,
            new_keyword: new_keyword,
            new_url: new_url
         }, (response) => {

            // display success or error message depending
            // on response from background.js
            if (response.success) {
               div_alert_error.style.display = 'none';
               div_alert_success.innerHTML = `<p>${response.message}</p>`;
               div_alert_success.style.display = 'block';
               form_edit.reset();
               form_edit.style.display = 'none';
               div_storage.style.display = 'block';
               getQuickLinks();

            } else {
               div_alert_success.style.display = 'none';
               div_alert_error.innerHTML = `<p>${response.message}</p>`;
               div_alert_error.style.display = 'block';
               form_edit.reset();
            }
         });
      }
   }

   // function to delete a quick-link
   function deleteLink(key) {
      chrome.runtime.sendMessage({
         type: 'delete_link',
         key: key
      }, (response) => {

         // display success or error message depending
         // on response from background.js
         if (response.success) {
            div_alert_error.style.display = 'none';
            div_alert_success.innerHTML = `<p>${response.message}</p>`;
            div_alert_success.style.display = 'block';
            getQuickLinks();

         } else {
            div_alert_success.style.display = 'none';
            div_alert_error.innerHTML = `<p>${response.message}</p>`;
            div_alert_error.style.display = 'block';
         }
      });
   }
});
