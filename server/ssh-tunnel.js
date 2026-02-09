const { Client } = require('ssh2');
const net = require('net');

const SSH_CONFIG = {
  host: process.env.SSH_HOST || '66.97.35.249',
  port: parseInt(process.env.SSH_PORT || '5695'),
  username: process.env.SSH_USER || 'root',
  password: process.env.SSH_PASSWORD || 'lucas171115!Lamascotera'
};

const LOCAL_PORT = 5433;
const REMOTE_HOST = '127.0.0.1';
const REMOTE_PORT = 5432;

let sshClient = null;

function createTunnel() {
  return new Promise((resolve, reject) => {
    sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('SSH tunnel established');

      const server = net.createServer((socket) => {
        sshClient.forwardOut(
          '127.0.0.1', 0,
          REMOTE_HOST, REMOTE_PORT,
          (err, stream) => {
            if (err) {
              socket.end();
              return;
            }
            socket.pipe(stream).pipe(socket);
          }
        );
      });

      server.listen(LOCAL_PORT, '0.0.0.0', () => {
        console.log(`SSH tunnel: 0.0.0.0:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT}`);
        resolve(server);
      });

      server.on('error', reject);
    });

    sshClient.on('error', (err) => {
      console.error('SSH connection error:', err.message);
      reject(err);
    });

    sshClient.on('close', () => {
      console.log('SSH connection closed. Reconnecting in 5s...');
      setTimeout(createTunnel, 5000);
    });

    sshClient.connect(SSH_CONFIG);
  });
}

module.exports = { createTunnel, LOCAL_PORT };

// If run directly, start the tunnel
if (require.main === module) {
  createTunnel().catch(console.error);
}
