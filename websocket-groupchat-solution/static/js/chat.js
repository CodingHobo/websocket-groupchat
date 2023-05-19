"use strict";

/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username? (no spaces)");


/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
  console.log("open", evt);

  let data = { type: "join", name: name };
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
  } else if (msg.type == "priv-chat") {
    item = $(`<li><b>${msg.name} </b><i>(private message): </i>${msg.text}</li>`);
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


/** formatMsgData
 * - formats msg data and determines type/text
 * - returns { type, text, toUser }
 */

function formatMsgData(msg) {
  let text;
  let type;
  // used for private chat, defaults to empty string
  let recipient = "";

  if (msg === "/joke") {
    type = "get-joke";
    text = "";

  } else if (msg === "/members") {
    type = "get-members";
    text = "";

  } else if (msg.startsWith("/name ")) {
    type = "change-username";

    // text should be the new username
    // msg: "/name newUserName"
    text = msg.split(" ")[1];

  } else if (msg.startsWith("/priv ")) {
    // msg: "/priv newUserName private msg text"
    const msgParts = msg.split(" ");
    const msgRecipient = msgParts[1];
    const msgText = msgParts.slice(2);

    type = "priv-chat";
    text = msgText.join(" ");
    recipient = msgRecipient;

  } else {
    type = "chat";
    text = msg;
  }

  return { type, text, recipient }
}


/** send message when button pushed. */

$("form").submit(function (evt) {
  evt.preventDefault();

  let msg = $("#m").val();

  let data = formatMsgData(msg);
  ws.send(JSON.stringify(data));

  $("#m").val("");
});

