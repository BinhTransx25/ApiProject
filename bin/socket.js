const { confirmOrder, shopOwnerCancelOrder, CustomerCancelOrder } = require("../controllers/order/ControllerOrder");
const { confirmOrderShipperExists, confirmOrderByShipperId, cancelOrderByShipperId } = require("../controllers/shipper/ControllerShipper");
const Order = require("../controllers/order/ModelOrder"); // Import model Order

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("A client connected", socket.id);

    // Khi client tham gia một room
    socket.on("join_room", async (roomID) => {
      socket.join(roomID);
      console.log(`Client ${socket.id} joined room ${roomID}`);
    });

    // Nhận tin nhắn từ client và phát lại cho các client khác trong cùng room
    socket.on("send_message", ({ roomID, data }) => {
      io.to(roomID).emit("receive_message", data);
      console.log(`Message from room ${roomID}: ${data.text}`);
    });

    // Khi có đơn hàng mới được tạo
    socket.on("order_created", (orderData) => {
      const shopOwnerId = orderData.shopOwnerId;
      io.to(shopOwnerId).emit("new_order_created", orderData);
      console.log(`New order created for shop ${shopOwnerId}: ${orderData.orderId}`);
    });

    // ShopOwner xác nhận đơn hàng
    socket.on("confirm_order", async (orderId) => {
      try {
        const order = await confirmOrder(orderId, io);
        socket.emit("order_confirmed", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error confirming order:", error);
      }
    });

    // ShopOwner hủy đơn hàng
    socket.on("cancel_order", async (orderId, reason) => {
      try {
        const order = await shopOwnerCancelOrder(orderId, reason, io);
        socket.emit("order_cancelled", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error cancelling order:", error);
      }
    });

    // Lắng nghe sự kiện cập nhật trạng thái đơn hàng từ client
    socket.on("update_order_status", async ({ orderId, status }) => {
      try {
        // Tìm và cập nhật trạng thái đơn hàng
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status, updatedAt: new Date() },
          { new: true } // Trả về order sau khi cập nhật
        );

        if (!order) {
          throw new Error("Order không tồn tại.");
        }

        // Gửi thông báo trạng thái mới đến các client trong room của đơn hàng
        io.to(orderId).emit("order_status_updated", {
          orderId,
          status: order.status,
        });
        io.to(orderId).emit("order_status", {
          orderId,
          status: order.status,
        });

        console.log(`Order ${orderId} status updated to ${status}`);
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error updating order status:", error);
      }
    });

    // Xác nhận đơn hàng có shipper
    socket.on("confirm_order_shipper_exists", async ({ orderId, shipperId }) => {
      try {
        const order = await confirmOrderShipperExists(orderId, shipperId, io);
        socket.emit("order_confirmed", { orderId, status: order.status });
      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error confirming order for shipper:", error);
      }
    });

    socket.on("confirm_order_by_shipper_id", async ({ orderId, shipperId }) => {
      try {
        const order = await confirmOrderByShipperId(orderId, shipperId, io);
        socket.emit("order_confirmed", { orderId, status: order.status });
        socket.emit("order_status", { orderId, status: order.status });
        // Gửi thông báo trạng thái mới đến các client trong room của đơn hàng
        io.to(orderId).emit("order_status_updated", {
          orderId,
          status: order.status,
        });

      } catch (error) {
        socket.emit("error", { message: error.message });
        console.error("Error confirming order by shipper ID:", error);
        console.error("Error updating order status:", error);
      }
    });

    // Khi client ngắt kết nối
    socket.on("disconnect", () => {
      console.log("A client disconnected", socket.id);
    });
  });
};
