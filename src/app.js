// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments , createFragment, getFragmentData} from './api';
import { ConsoleLogger } from "@aws-amplify/core";

function createFragmentList(user, fragments) {
  var list = document.createElement("ul");
  fragments.forEach(async (d) => {
    let li = document.createElement("li");
    li.innerHTML = `Id: ${d.id}, Created: ${d.created}`;
    list.append(li);
  });
  return list;
}

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentForm = document.querySelector('#fragmentForm');
  const formSection = document.querySelector("#form");
  const listFragment = document.querySelector("#listFragment");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);
  let responseGetUserFragments = await getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;
  listFragment.hidden = false;
  formSection.hidden = false;


  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // show user's fragment
  if (responseGetUserFragments.status == "ok") {
    const fragments = responseGetUserFragments.fragments;
    if (fragments.length > 0) {
      const ul = createFragmentList(user, fragments);
      listFragment.append(ul);
    }
  } else {
    listFragment.innerHTML = "<p>Error loading Fragments data for user</p>"; 
  }


  // Disable the Login button
  loginBtn.disabled = true;

  fragmentForm.onsubmit = (event) => {
    event.preventDefault();
    console.log("Form submit");
    console.log(event.target.fragmentData.value);
    const data = event.target.fragmentData.value;
    createFragment(user, data);
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);