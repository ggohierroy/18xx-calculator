import { Server } from "socket.io";

const SocketHandler = (req:any, res:any) => {
  if (res.socket.server.io) {

  } else {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        socket.on('join-game', (gameId: number) => {
            socket.join(gameId.toString());
        })
    })
  }
  res.end()
}

export default SocketHandler