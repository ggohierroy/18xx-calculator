import { ServerResponse } from "http";
import { NextApiResponse } from "next";
import { Server } from "socket.io";

const SocketHandler = (req:any, res:any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
        socket.on('join-game', gameId => {
            socket.join(gameId);
            console.log(`joined game ${gameId}`);
        })
    })
  }
  res.end()
}

export default SocketHandler