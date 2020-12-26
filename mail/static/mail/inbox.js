
var body_reply;
var time_reply;
var reply;

document.addEventListener('DOMContentLoaded', function() {

  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  load_mailbox('inbox');
   
  
});
  
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-display').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.addEventListener('submit' , function (e) {
    console.log('Composing....')
    e.preventDefault()

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.getElementById("compose-recipients").value,
          subject: document.getElementById('compose-subject').value,
          body: document.getElementById('compose-body').value
      })
    })
    // By default, load the inbox
    load_mailbox("sent");
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      for ( i = 0; i < emails.length; i++) {
        const post = document.createElement('div');
        post.className = 'd-flex border border-dark m-2';
        post.innerHTML = `<div class="p-2"><strong>${emails[i].sender}</strong></div>
        <div class="p-2"><a href='#' onclick='email_display(${emails[i].id})'>${emails[i].subject}</a></div>
        <div class="ml-auto p-2">${emails[i].timestamp}</div> <br>`;
  
        document.querySelector('#emails-view').append(post);
      };
  });   
}


function email_display (email_id) {
  document.querySelector('#email-display').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

      document.getElementById('From').innerHTML = email.sender;
      document.getElementById('To').innerHTML = email.recipients;
      document.getElementById('Subject').innerHTML = email.subject;
      document.getElementById('Timestamp').innerHTML = email.timestamp;
      document.getElementById('Body').innerHTML = email.body;
      document.getElementById('Read').innerHTML = email.read;


      if (email.read === true) {
        document.getElementById('read').style.display = 'none';
      }


      const archive = document.getElementById('archive')
      console.log(email.archived)
      document.getElementById("archive").addEventListener('click' , () => {
        mark_archive(email_id , email.archived);

        if (archive.innerText == "Archive") { 
          archive.innerText = "Unarchive"} else {
          archive.innerText = "Archive"};
         

      });
      if (!email.archived) {
        archive.innerHTML = "Archive" } else {
        archive.innerHTML = "Unarchive"};
      
      


      document.getElementById("read").addEventListener('click' , () => {
        mark_read(email_id);
        document.getElementById('read').style.display = 'none';
      });

      document.getElementById('reply').addEventListener('click' , () => {
        reply = true;
        console.log(reply);
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#email-display').style.display = 'none';
      
        fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-subject').value = '';
          document.querySelector('#compose-body').value = '';
      
          body_reply = email.body;
          time_reply = email.timestamp;
        
        });
        
        document.addEventListener('submit' , function (e) {
          if (reply) {
            console.log('Replying....')
            e.preventDefault()
            reply_email(body_reply,time_reply);
            // By default, load the inbo
          }
          else {
            console.log('Error')
          }
        });
      });
      
    });
  
}

function reply_email (body_reply,time_reply) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.getElementById("compose-recipients").value,
        subject: `Re: ${document.getElementById('compose-subject').value}`,
        body: `${document.getElementById('compose-body').value}<div class='border pt-3'><p>${body_reply}</p><p>${time_reply}</p></div>`
    })
  })
  reply = false;
  load_mailbox('sent')
}


function mark_read (email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  return true

}

function mark_archive(email_id, state) {
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),

  });
  return true

}


