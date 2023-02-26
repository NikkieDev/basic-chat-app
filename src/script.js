var socket = new WebSocket(`ws://${location.hostname}:3001`);

socket.onopen = event => {
    document.getElementById('messages').innerText = "Syncing...";
    console.log("Connected");
};

socket.onmessage = msg => {
    if (JSON.parse(msg.data)["type"] == "connectionUpdate") {
        switch (JSON.parse(msg.data)["wsStatus"]) {
            case "OPEN":
                document.getElementById('messages').innerHTML = '';
                break;
            case "SYNC":
                document.getElementById('messages').innerHTML = 'Syncing..';
                break;
        }
    } else if (JSON.parse(msg.data)["type"] == "message") {
        let msgStyle;

        if (JSON.parse(msg.data)["sender"] == localStorage.getItem('username')) {
            msgStyle = 'bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl';
        } else {
            msgStyle = 'bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl';
        }

        document.getElementById('messages').innerHTML += `
        <div class='message'>
            <h3 class='message-sender'>${JSON.parse(msg.data)['sender']}</h3>
            <div class='mr-2 py-3 px-4 ${msgStyle} text-white'>
                <p>${JSON.parse(msg.data)['msg']}</p>
            </div>
        </div>`
    }
}

socket.onclose = event => {
    console.log("Disconnected from socket");
}

const sendForm = document.getElementById('sendMessage');
const newMsg = document.getElementById('newMsg');
const transfer = document.getElementById('transfer');

const nameForm = document.getElementById('setUsername');
const usernameForm = document.getElementById('usernameForm');
const newName = document.getElementById('newName');
const updateBtn = document.getElementById('update');
const headerText = document.getElementById('headerText');

if (localStorage.getItem('username')) {
    usernameForm.classList.add('hidden');
    headerText.innerText = `Hello, ${localStorage.getItem('username')}!`
}

updateBtn.addEventListener('click', event => {
    event.preventDefault();

    localStorage.setItem('username', newName.value);
});

transfer.addEventListener('click', event => {
    event.preventDefault();

    if (newMsg.value.length < 1) {
        return alert('Message cannot be empty!');
    } else {
        if (socket.readyState == socket.CLOSED) {
            location.reload();
        }
    
        let sending = {
            type: "message",
            text: newMsg.value,
            username: localStorage.getItem('username')
        };
    
        console.log("sending message")
        socket.send(JSON.stringify(sending));
    
        newMsg.value = '';
    }
});