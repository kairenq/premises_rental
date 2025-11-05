import React from 'react';
import { Card, Row, Col, Button, Statistic } from 'antd';
import {
  ShopOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 20px',
          borderRadius: 8,
          marginBottom: 30,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 48, margin: 0, color: 'white' }}>
          Welcome to Premises Rental System
        </h1>
        <p style={{ fontSize: 20, marginTop: 20 }}>
          Find your perfect office or commercial space
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/rooms')}
          style={{ marginTop: 20 }}
        >
          Browse Rooms
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Available Rooms"
              value={45}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Buildings"
              value={12}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Leases"
              value={89}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Registered Users"
              value={234}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 30 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 200,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShopOutlined style={{ fontSize: 64, color: '#1890ff' }} />
              </div>
            }
          >
            <Card.Meta
              title="Modern Offices"
              description="Find modern office spaces with all amenities for your business"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 200,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HomeOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              </div>
            }
          >
            <Card.Meta
              title="Commercial Spaces"
              description="Retail and commercial spaces in prime locations"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 200,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileTextOutlined style={{ fontSize: 64, color: '#fa8c16' }} />
              </div>
            }
          >
            <Card.Meta
              title="Easy Leasing"
              description="Simple and transparent leasing process with online management"
            />
          </Card>
        </Col>
      </Row>

      {!user && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h2>Get Started Today</h2>
          <p style={{ fontSize: 16, marginBottom: 20 }}>
            Register now to browse and lease properties
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/register')}
          >
            Register Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
