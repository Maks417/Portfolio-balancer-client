import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { BalanceForm } from './BalanceForm';

export class Home extends Component {
  static displayName = Home.name;

  render () {
    return (
      <Container>
        <Row>
          <Col className='justify-content-md-center'>
            <BalanceForm />
          </Col>
        </Row>
      </Container>
    );
  }
}
