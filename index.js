const dotenv = require("dotenv");
dotenv.config();

const io = require("socket.io")(process.env.PORT || 8900, {
  cors: {
    origin: process.env.SOCKET_URL,
  },
});

let users = [];
const addUser = (userId, socketId)=>{
	!users.some((user) => user.userId === userId) && users.push({userId, socketId});
}

const removeUser = (socketId) => {
	users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
	return users.find(user => user.userId === userId);
}

io.on("connection", (socket) => {
	// when connect
  console.log("a user connected.");

  // take userId and socketId from user
  socket.on("addUser", userId => {
  	addUser(userId, socket.id);
  	io.emit("getUsers", users); // getUsers when have new user
  })

  // send and get message
  socket.on("sendMessage", ({senderId, receiverId, text})=>{
  	const user = getUser(receiverId);
  	io.to(user?.socketId).emit("getMessage", {
  		senderId,
  		text,
  	})
  })

  // Add & get post 
  socket.on("addPost", ({post})=>{
    io.emit("getPost", {
      post
    })
  })

  // Add & get comment 
  socket.on("addComment", ({postId, comment, senderId})=>{
    io.emit("getComment", {
      senderId,
      postId,
      comment,
    })
  })

  // Add & get like 
  socket.on("addLike", ({postId, senderId, state})=>{
    io.emit("getLike", {
      postId, 
      senderId,
      state,
    })
  })

  // Add & get like comment
  socket.on("addLikeComment", ({postId, senderId, state, commentId})=>{
    io.emit("getLikeComment", {
      postId, 
      commentId,
      senderId,
      state,
    })
  })

  // Add & get add friend notification 
  socket.on("addNotification", ({senderId, receiverId})=>{
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getNotification", {
      senderId,
    })
  })

  socket.on("responseNotification", ({senderId, receiverId, type})=>{
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getResponseNotification", {
      senderId,
      type
    })
  })

  socket.on("removeNotification", ({senderId, receiverId})=>{
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getRemoveNotification", {
      senderId,
    })
  })

  // Add & get follow notification 

  socket.on("addFollowNotification", ({senderId, receiverId, type})=>{
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getFollowNotification", {
      senderId,
      type
    })
  })

  // Add & get unfriend notification
  socket.on("addUnfriendNotification", ({senderId, receiverId})=>{
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getUnfriendNotification", {
      senderId,
    })
  })

  // when disconnect
  socket.on("disconnect", ()=>{
  	console.log("a user disconnected!");
  	removeUser(socket.id);
  	io.emit("getUsers", users);
  })
});
