import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const StatsCards = ({ stats }) => (
  <>
    <h2 className="mb-4">儀表盤</h2>
    <Row>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="primary" text="white"><Card.Body><Card.Title className="fs-2">{stats.totalNotes}</Card.Title><Card.Text>總筆記數</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="success" text="white"><Card.Body><Card.Title className="fs-2">{stats.normalNotes}</Card.Title><Card.Text>普通筆記</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="info" text="white"><Card.Body><Card.Title className="fs-2">{stats.weeklyNotes}</Card.Title><Card.Text>周報數量</Card.Text></Card.Body></Card>
      </Col>
      <Col md={6} xl={3} className="mb-4">
        <Card bg="secondary" text="white"><Card.Body><Card.Title className="fs-2">{stats.archivedNotes}</Card.Title><Card.Text>已封存</Card.Text></Card.Body></Card>
      </Col>
    </Row>
  </>
);

export default StatsCards;
