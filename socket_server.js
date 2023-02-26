const ws = require('ws');
const wss = new ws.Server({port: 3001});

var connected = 0;
var cache = [];

async function syncUser(socket) {
    console.log(`Syncing with user...`);
    let synced = 0;

    if (socket.readyState == ws.OPEN) {
        await socket.send(JSON.stringify({type: "connectionUpdate", wsStatus: "OPEN"}));
        
        cache.forEach(msg => {
            socket.send(JSON.stringify(msg));
            synced++;
        });
    }

    console.log(`Synced ${synced} messages with user`);
}

wss.on('connection', async (socket) => {
    connected++;
    console.log(`User has joined. Total connected: ${connected}.`);

    await syncUser(socket);

    socket.on('message', msg => {
        const decoder = new TextDecoder();
        msg = decoder.decode(msg);
        
        const msgData = JSON.parse(msg);
        
        const data = {
            type: 'message',
            sender: msgData['username'],
            msg: msgData['text']
        }
        
        cache.push(data);
        wss.clients.forEach(client => {
            if (client.readyState == ws.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    socket.on('close', () => {
        connected--;
        console.log(`User has left. Total connected: ${connected}`);
    })
});