import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET } from '../constants/orderConstants'

const OrderScreen = ({ match }) => {

    const orderId = match.params.id

    const [sdkReady, SetSdkReady] = useState(false)

    const dispatch = useDispatch()
    const orderDetails = useSelector((state) => state.orderDetails)
    const { order, loading, error } = orderDetails

    const orderPay = useSelector((state) => state.orderPay)
    const { loading: loadingPay, success: successPay } = orderPay

    if(!loading) {
        // calculate prices
        const addDecimals = (num) => {
            return (Math.round(num * 100) / 100).toFixed(2)
        }

        order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0))
    }


    useEffect(() => {
        const addPaypalScript = async () => {
            const { data: clientId } = await axios.get('http://localhost:5000/api/config/paypal')
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src =  `https://www.paypal.com/sdk/js?client-id=${clientId}`
            script.async = true
            script.onload = () => {
                SetSdkReady(true)
            }
            document.body.appendChild(script)
        }
            if(!order || successPay || order._id !== orderId) {
                dispatch({ type: ORDER_PAY_RESET })
                dispatch(getOrderDetails(orderId))
            } else if(!order.isPaid) {
                if(!window.paypal) {
                    addPaypalScript()
                } else {
                    SetSdkReady(true)
                }
            }
        
    }, [order, orderId, successPay])

    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(orderId, paymentResult))
    }

  return loading ? ( <Loader /> ) : error ? ( <Message varient='danger'>{error}</Message> ) : (
            <>
                <h1>Order {order._id}</h1>
                <Row>
                    <Col md={8}>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <h2>Shipping</h2>
                                <p><strong>Name: </strong> {order.user.name}</p>
                                <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
                                <p>
                                    <strong>Address:</strong> {order.shippingAddress.address},{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                    {order.isDelivered ? <Message varient='success'>Delivered On {order.deliverdAt}</Message> : <Message varient='danger'>Not Delivered</Message>}
                                </p>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <h2>Payment Mathod</h2>
                                <p>
                                    <strong>Mathod: </strong> {order.paymentMethod === 'CoD' ? 'Pay on Delivery' : order.paymentMethod}
                                    {order.isPaid ? <Message varient='success'>Paid On {order.paidAt}</Message> : <Message varient='danger'>Not Paid</Message>}
                                </p>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <h2>Order Items</h2>
                                {order.orderItems.length === 0 ? <Message>Order is Empty</Message> : (
                                    <ListGroup variant='flush'>
                                        {order.orderItems.map((item, index) => (
                                            <ListGroup.Item key={index}>
                                                <Row>
                                                    <Col md={1}>
                                                        <Image src={item.image} alt={item.name} fluid rounded />
                                                    </Col>
                                                    <Col>
                                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                    </Col>
                                                    <Col md={4}>
                                                        {item.qty} x Rs {item.price} = Rs {item.qty * item.price}
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={4}>
                        <Card>
                            <ListGroup.Item>
                                <h2>Order Sumery</h2>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>Rs {order.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping Price</Col>
                                    <Col>Rs {order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>Rs {order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>Rs {order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                                {!order.isPaid && (
                                    <ListGroup.Item>
                                        {loadingPay && <Loader />}
                                        {!sdkReady && <Loader />}
                                        { order.paymentMethod == 'Paypal' ? <PayPalButton amount={order.totalPrice} onSuccess={successPaymentHandler}/> : <p className='text-center'>Pay To Our Delivery Partner</p>}
                                    </ListGroup.Item>
                                )}

                        </Card>
                    </Col>
                </Row>
            </>
        )
}

export default OrderScreen