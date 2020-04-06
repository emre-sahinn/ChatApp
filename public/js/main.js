const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//get username from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//msg from server
socket.on("msg", (message) => {
  console.log(message);
  outputMsg(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", (e) => {
  //prevent submit event
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  //emit to server
  socket.emit("chatmsg", msg);

  //clear input
  e.target.elements.msg.value = "";
  //focus
  e.target.elements.msg.focus();
});

function outputMsg(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
//add user to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
//npm run dev to start server
