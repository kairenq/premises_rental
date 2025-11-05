import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Statistic, Spin } from 'antd';
import {
  ShopOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { statsAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

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
          Добро пожаловать в систему аренды помещений
        </h1>
        <p style={{ fontSize: 20, marginTop: 20 }}>
          Найдите идеальное офисное или коммерческое помещение
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/rooms')}
          style={{ marginTop: 20 }}
        >
          Просмотреть помещения
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Доступных помещений"
              value={stats?.available_rooms || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Зданий"
              value={stats?.total_buildings || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активных аренд"
              value={stats?.active_leases || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Зарегистрированных пользователей"
              value={stats?.registered_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            cover={
              <div
                style={{
                  height: 220,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <ShopOutlined style={{ fontSize: 80, color: 'white' }} />
              </div>
            }
          >
            <Card.Meta
              title={<div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Современные офисы</div>}
              description={
                <div style={{ fontSize: 15, lineHeight: 1.6, minHeight: 60 }}>
                  Найдите современные офисные помещения со всеми удобствами для вашего бизнеса
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            cover={
              <div
                style={{
                  height: 220,
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <HomeOutlined style={{ fontSize: 80, color: 'white' }} />
              </div>
            }
          >
            <Card.Meta
              title={<div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Коммерческие помещения</div>}
              description={
                <div style={{ fontSize: 15, lineHeight: 1.6, minHeight: 60 }}>
                  Торговые и коммерческие помещения в лучших локациях города
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{
              height: '100%',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            cover={
              <div
                style={{
                  height: 220,
                  background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <FileTextOutlined style={{ fontSize: 80, color: 'white' }} />
              </div>
            }
          >
            <Card.Meta
              title={<div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Простая аренда</div>}
              description={
                <div style={{ fontSize: 15, lineHeight: 1.6, minHeight: 60 }}>
                  Простой и прозрачный процесс аренды с онлайн-управлением
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {!user && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h2>Начните сегодня</h2>
          <p style={{ fontSize: 16, marginBottom: 20 }}>
            Зарегистрируйтесь сейчас, чтобы просматривать и арендовать помещения
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться сейчас
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
