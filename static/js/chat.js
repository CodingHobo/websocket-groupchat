"use strict";

/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const username = prompt("Username? (no spaces)");


/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
  console.log("open", evt);

  let data = { type: "join", name: username };
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  } else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  } else {
    return console.error(`bad message: ${msg}`);
  }

  $("#messages").append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$("form").submit(function (evt) {
  evt.preventDefault();

  let data;
  const input = $("#m").val();
  const inputs = input.split(" ");

  if (inputs[0] === '/joke') {
    data = { type: "get-joke" };
  } else if (inputs[0] === '/members') {
    data = { type: "get-members" };
  } else if (inputs[0] === '/name') {
    const newName = inputs.slice(1).join("");
    data = { type: "new-name", text: newName };
  } else {
    data = { type: "chat", text: input };
  }
  console.log("input = ", input);
  ws.send(JSON.stringify(data));

  $("#m").val("");
});
