import asyncHandler from "express-async-handler";
import Order from '../models/orderModal.js'
import Product from "../models/productModal.js";

// @dec      Create New Order
// @routes   POst /api/orders
// @access   Private
const addOrderItems = asyncHandler(async(req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

    if(orderItems && orderItems.length === 0) {
        res.status(400)
        throw new Error('No order items')
    } else {
        const order = new Order({
            orderItems, 
            user: req.user._id,
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice,
            shippingPrice, 
            totalPrice
        })

        const createdOrder = await order.save()

        res.status(201).json(createdOrder)
    }
})


// @dec      Get order By Id
// @routes   get /api/orders/:id
// @access   Private
const getOrderById = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(order) {
        res.json(order)
    } else {
        res.status(404)
        throw new Error('Order Not Found')
    }
})


// @dec      Update Order to paid
// @routes   get /api/orders/:id/pay
// @access   Private
const updateOrdertoPaid = asyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id)

    if(order) {
        order.isPaid = true
        order.paidAt = Date.now()
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.payer.email_address
        }

        const updatedOrder = await order.save()

        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order Not Found')
    }
})

// @dec      Get logged in user order
// @routes   get /api/orders/myorders
// @access   Private
const getMyOrders = asyncHandler(async(req, res) => {
    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name')
    res.json(orders)
})


// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
  
    if (order) {
      order.isDelivered = true
      order.deliveredAt = Date.now()
  
      const updatedOrder = await order.save()
  
      res.json(updatedOrder)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
})

// @desc    Update Shipping 
// @route   GET /api/orders/:id/shipped
// @access  Private/Admin

const updateOrderToShipped = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if(order) {
        order.isShipped = true
        order.shippedAt = Date.now()

        const updateShippedOrder = await order.save()

        res.json(updateShippedOrder)
    } else {
        res.status(404)
        throw new Error('Order Not found!')
    }
})

// @desc    Update Shipping Courier Details
// @route   GET /api/orders/:id/updateCourier
// @access  Private/Admin

const updateCourierDetails = asyncHandler(async(req, res) => {
    const {
        awb_number,
        courier_name,
        label,
        order_id,
        shipment_id,
        status
      } = req.body

      const order = await Order.findById(req.params.id)

    if(order) {
        order.awb_number = awb_number,
        order.courier_name = courier_name,
        order.label = label,
        order.order_id = order_id,
        order.shipment_id = shipment_id,
        order.status = status

        const updateCourier = await order.save()
        res.json(updateCourier)
    } else {
        res.status(404)
        throw new Error('Order Not found!')
    }
})


export { addOrderItems, getOrderById, updateOrdertoPaid, getMyOrders, getOrders, updateOrderToDelivered, updateOrderToShipped, updateCourierDetails }