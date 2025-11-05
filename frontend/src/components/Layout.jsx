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
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = AntLayout;

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
      label: 'Выйти',
      onClick: handleLogout,
    },
  ];

  const menuItems = user
    ? [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: <Link to="/">Главная</Link>,
        },
        {
          key: '/rooms',
          icon: <ShopOutlined />,
          label: <Link to="/rooms">Помещения</Link>,
        },
        ...(user.role === 'admin'
          ? [
              {
                key: '/admin',
                icon: <DashboardOutlined />,
                label: <Link to="/admin">Админ панель</Link>,
              },
            ]
          : user.role === 'landlord'
          ? [
              {
                key: '/landlord',
                icon: <DashboardOutlined />,
                label: <Link to="/landlord">Панель арендодателя</Link>,
              },
            ]
          : [
              {
                key: '/my-leases',
                icon: <FileTextOutlined />,
                label: <Link to="/my-leases">Мои аренды</Link>,
              },
            ]),
      ]
    : [
        {
          key: '/',
          icon: <HomeOutlined />,
          label: <Link to="/">Главная</Link>,
        },
        {
          key: '/rooms',
          icon: <ShopOutlined />,
          label: <Link to="/rooms">Помещения</Link>,
        },
      ];

  return (
    <AntLayout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          flexShrink: 0,
        }}
      >
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          Аренда Помещений
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
                <LoginOutlined /> Войти
              </Button>
              <Button onClick={() => navigate('/register')}>Регистрация</Button>
            </Space>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5', flex: 1, overflow: 'auto' }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;
