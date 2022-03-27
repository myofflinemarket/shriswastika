import React from 'react';
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded shadow' >
        <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image ? 'http://www.shriswastika.com/'+product.image.split(',')[0] : product.image.split(',')[0]} variant='top'/>
        </Link>    

        <Card.Body>
            <Link to={`/product/${product._id}`}>
                <Card.Title as='div'>
                    <strong>{product.name}</strong>
                </Card.Title>
            </Link>    

            <Card.Text as='div'>
                <Rating value={product.rating} text={`${product.numReviews} reviews`}/>
            </Card.Text>

            <Card.Text as='h3'>
                Rs {product.price}
            </Card.Text>
        </Card.Body>
    </Card>
  )
};

export default Product;
