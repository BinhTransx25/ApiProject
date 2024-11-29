const { confirmOrder, shopOwnerCancelOrder, CustomerCancelOrder } = require("../controllers/order/ControllerOrder");
const { confirmOrderShipperExists, confirmOrderByShipperId, cancelOrderByShipperId } = require("../controllers/shipper/ControllerShipper");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("A client connected", socket.id);

    /** 
        // Khi shipper hoặc user tham gia vào một room (phòng chat cho đơn hàng)
        socket.on('join_room', async ({ roomId, userId, shipperId }) => {
            try {
                const order = await Order.findById(roomId); // Giả sử bạn có một model Order
                if (order && order.status === 'confirmed' && (order.userId === userId || order.shipperId === shipperId)) {
                    socket.join(roomId);
                    socket.emit('join_room_success', { roomId });
                    console.log(`Client ${socket.id} joined room ${roomId}`);
                } else {
                    socket.emit('join_room_failed', { message: 'Order chưa được xác nhận hoặc bạn không có quyền tham gia phòng này.' });
                    console.log(`Client ${socket.id} failed to join room ${roomId}`);
                }
            } catch (error) {
                socket.emit('join_room_failed', { message: error.message });
                console.error(`Failed to join room ${roomId}`, error);
            }
        });

        // Nhận tin nhắn từ client và phát lại cho các client khác trong cùng room
        socket.on('send_message', (data) => {
            const { roomId, senderId, message, timestamp } = data;
            io.to(roomId).emit('receive_message', { senderId, message, timestamp });
            console.log(`Message from ${senderId} in room ${roomId}: ${message}`);
        });
        */
    // Khi shipper hoặc user tham gia vào một room (phòng chat cho đơn hàng)
    socket.on("join_room", async (roomID) => {
      socket.join(roomID);
      console.log(`Client ${socket.id} joined room ${roomID}`);
    });

    // Nhận tin nhắn từ client và phát lại cho các client khác trong cùng room
    socket.on("send_message", ({ roomID, data }) => {
      //console.log('Room ID received:', roomID);
      io.to(roomID).emit("receive_message", data);
      //console.log(`Message from ${data.name}: ${data.text}`);
    });
    // Khi có đơn hàng mới được tạo và bắn socket tới shopOwner
    socket.on("order_created", (orderData) => {
      const shopOwnerId = orderData.shopOwnerId; // Lấy ID của cửa hàng từ orderData

      // Gửi thông báo đến room của cửa hàng tương ứng
      io.to(shopOwnerId).emit("new_order_created", orderData);
      console.log(
        `New order created for shop ${shopOwnerId}: ${orderData.orderId}`
      );
    });

    // ShopOwner Xác nhận đơn hàng
    socket.on("confirm_order", async (orderId) => {
      try {
        const order = await confirmOrder(orderId, io); // Gọi hàm confirmOrder từ controller
        socket.emit("order_confirmed", { orderId, status: order.status });
        socket.emit("order_status", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error confirming order:", error);
      }
    });

    // ShopOwner Hủy đơn hàng
    socket.on("cancel_order", async (orderId) => {
      try {
        const order = await shopOwnerCancelOrder(orderId, io); // Gọi hàm shopOwnerCancelOrder từ controller
        socket.emit("order_cancelled", { orderId, status: order.status });
        socket.emit("order_status", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error cancelling order:", error);
      }
    });

    // Hủy đơn hàng (Customer)
    socket.on("customer_cancel_order", async (orderId) => {
      try {
        const order = await CustomerCancelOrder(orderId, io); // Gọi hàm CustomerCancelOrder từ controller
        socket.emit("order_cancelled", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error cancelling order by customer:", error);
      }
    });

    // Xác nhận đơn hàng có shipper
    socket.on(
      "confirm_order_shipper_exists",
      async ({ orderId, shipperId }) => {
        try {
          const order = await confirmOrderShipperExists(orderId, shipperId,io);
          socket.emit("order_confirmed", { orderId, status: order.status });
          socket.emit("order_status", { orderId, status: order.status });
        } catch (error) {
          socket.emit("error", { message: error.message });
          console.error("Error confirming order for shipper:", error);
        }
      }
    );

    // Xác nhận đơn hàng theo shipper ID
    socket.on("confirm_order_by_shipper_id", async ({ orderId, shipperId }) => {
      try {
        const order = await confirmOrderByShipperId(orderId, shipperId,io);
        socket.emit("order_confirmed", { orderId, status: order.status });
        socket.emit("order_status", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error confirming order by shipper ID:", error);
      }
    });

    // Hủy đơn hàng theo shipper ID
    socket.on("cancel_order_by_shipper_id", async ({ orderId, shipperId }) => {
      try {
        const order = await cancelOrderByShipperId(orderId, shipperId);
        socket.emit("order_cancelled", { orderId, status: order.status });
        socket.emit("order_status", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error cancelling order by shipper ID:", error);
      }
    });

    // Khi client ngắt kết nối
    socket.on("disconnect", () => {
      console.log("A client disconnected", socket.id);
    });
  });
};
