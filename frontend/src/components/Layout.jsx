import React from 'react';
import { Layout as AntLayout, Menu, Button, Dropdown, Space } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  LoginOutlined,
  ShopOutlined,
  FileTextOutlined,
  ToolOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.full_name,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const menuItems = user
    ? [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: <Link to="/">Home</Link>,
        },
        {
          key: '/rooms',
          icon: <ShopOutlined />,
          label: <Link to="/rooms">Rooms</Link>,
        },
        ...(user.role === 'admin'
          ? [
              {
                key: '/admin',
                icon: <DashboardOutlined />,
                label: <Link to="/admin">Admin Panel</Link>,
              },
            ]
          : [
              {
                key: '/my-leases',
                icon: <FileTextOutlined />,
                label: <Link to="/my-leases">My Leases</Link>,
              },
              {
                key: '/favorites',
                icon: <HeartOutlined />,
                label: <Link to="/favorites">Favorites</Link>,
              },
              {
                key: '/maintenance',
                icon: <ToolOutlined />,
                label: <Link to="/maintenance">Maintenance</Link>,
              },
            ]),
      ]
    : [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: <Link to="/">Home</Link>,
        },
        {
          key: '/rooms',
          icon: <ShopOutlined />,
          label: <Link to="/rooms">Rooms</Link>,
        },
      ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
        }}
      >
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          Premises Rental
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, marginLeft: 30 }}
        />
        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" style={{ color: 'white' }}>
                <Space>
                  <UserOutlined />
                  {user.full_name}
                </Space>
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Button type="primary" onClick={() => navigate('/login')}>
                <LoginOutlined /> Login
              </Button>
              <Button onClick={() => navigate('/register')}>Register</Button>
            </Space>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: 'white' }}>
        Premises Rental System © 2025
      </Footer>
    </AntLayout>
  );
};

export default Layout;
