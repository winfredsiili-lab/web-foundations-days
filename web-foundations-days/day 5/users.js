
const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const list = document.querySelector("#users-list");


let users = [];


function renderUsers(userList) {
  list.innerHTML = ""; 

  if (userList.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No users match your filter.";
    list.appendChild(message);
    return;
  }

  userList.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("p");
    name.classList.add("user-name");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;

    li.appendChild(name);
    li.appendChild(email);
    li.appendChild(city);
    li.appendChild(company);
    list.appendChild(li);
  });
}


function getFilteredUsers() {
  const query = filterInput.value.trim().toLowerCase();
  return users.filter((user) => user.name.toLowerCase().includes(query));
}


async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;
  list.innerHTML = "";
  users = [];

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    users = await response.json();
    renderUsers(getFilteredUsers()); 
    statusText.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error(error);
  } finally {
    loadBtn.disabled = false; 
  }
}


loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  if (users.length === 0) return; // nothing loaded yet
  renderUsers(getFilteredUsers());
});