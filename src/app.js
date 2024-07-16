// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, createFragment } from './api';

function createFragmentList(fragments) {
  var list = document.createElement("ol");
  fragments.forEach(async (d) => {
    let li = document.createElement("li");
    li.innerHTML = `Id: ${d.id}  <br/>  Created: ${new Date(d.created).toDateString()} <br/> Type: ${d.type} `;
    list.append(li);
  });
  return list;
}

async function displayUserFragmentList(user, listFragment) {
  let responseGetUserFragments = await getUserFragments(user);
  var listFragmentDiv = listFragment.querySelector("div");
  listFragmentDiv.innerHTML = "";
  if (responseGetUserFragments.status === "ok") {
    const fragments = responseGetUserFragments.fragments;
    if (fragments.length > 0) {
      const ul = createFragmentList(fragments);
      listFragmentDiv.append(ul);
    }
  } else {
    listFragmentDiv.innerHTML = "<p>Error loading Fragments data for user</p>";
  }
}

async function init() {
  console.log("init got called");
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentForm = document.querySelector('#fragmentForm');
  const formSection = document.querySelector("#form");
  const listFragment = document.querySelector("#listFragment");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    logoutBtn.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  await getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;
  listFragment.hidden = false;
  formSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Show user's fragments
  //await displayUserFragmentList(user, listFragment);

  // Disable the Login button
  loginBtn.disabled = true;

  fragmentForm.onsubmit = async (event) => {
    event.preventDefault();
    console.log("Form submit");
    let contentType = event.target.fragmentType.value;
    let data = event.target.fragmentFile.files[0];
    console.log("Content type: " + contentType);
    console.log("data: " + data);

    // Use FormData to handle file upload
    const formData = new FormData();
    formData.append("fragmentFile", data);
    formData.append("fragmentType", contentType);

    await createFragment(user, formData, contentType);
    fragmentForm.reset();
    await displayUserFragmentList(user, listFragment);
  }
}

// Wait for the DOM to be ready, then start the app
document.addEventListener('DOMContentLoaded', init);
