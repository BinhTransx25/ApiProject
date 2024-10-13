module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A client connected', socket.id);

        // Khi có đơn hàng mới được tạo
        socket.on('order_created', (orderData) => {
            let { orderId, timeLeft } = orderData;

            // Đếm ngược thời gian
            let countdown = setInterval(() => {
                timeLeft--;
                socket.emit('countdown', { orderId, timeLeft });

                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    socket.emit('order_expired', { orderId });
                    console.log(`Order ${orderId} expired`);
                }
            }, 1000);
        });

        socket.on('accept_order', async (orderId) => {
            try {
                const updatedOrder = await confirmOrder(orderId, io);
                socket.emit('order_accepted', { orderId, status: updatedOrder.status });
                console.log(`Shipper accepted and confirmed order ${orderId}`);
            } catch (error) {
                socket.emit('accept_order_failed', { orderId, error: error.message });
                console.error(`Failed to accept and confirm order ${orderId}`, error);
            }
        });

        socket.on('cancel_order', async (orderId) => {
            try {
                const cancelledOrder = await cancelOrder(orderId);
                socket.emit('order_cancelled', { orderId, status: cancelledOrder.status });
                console.log(`Order ${orderId} has been cancelled`);
            } catch (error) {
                socket.emit('cancel_order_failed', { orderId, error: error.message });
                console.error(`Failed to cancel order ${orderId}`, error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A client disconnected', socket.id);
        });
    });
}
