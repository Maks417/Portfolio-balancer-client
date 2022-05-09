import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import BalanceForm from './BalanceForm';

const Home = () => {
  return (
    <Container>
      <Row>
        <Col className='row justify-content-md-center'>
          <BalanceForm />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;