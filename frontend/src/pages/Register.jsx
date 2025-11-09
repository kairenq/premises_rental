import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Регистрация успешна! Теперь войдите в систему.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            Регистрация
          </div>
        }
        style={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          borderRadius: '12px'
        }}
      >
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="full_name"
            label="Полное имя"
            rules={[{ required: true, message: 'Введите ваше полное имя!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#667eea' }} />}
              placeholder="Введите ваше полное имя"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите ваш email!' },
              { type: 'email', message: 'Введите корректный email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#667eea' }} />}
              placeholder="Введите ваш email"
              size="large"
            />
          </Form.Item>

          <Form.Item name="phone" label="Телефон (необязательно)">
            <Input
              prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
              placeholder="Введите ваш телефон"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            initialValue="user"
            rules={[{ required: true, message: 'Выберите роль!' }]}
          >
            <Select size="large" placeholder="Выберите роль">
              <Select.Option value="user">Пользователь</Select.Option>
              <Select.Option value="landlord">Арендодатель</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Введите пароль!' },
              { min: 6, message: 'Пароль должен быть минимум 6 символов!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Введите пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Подтверждение пароля"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Подтвердите пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Подтвердите пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: '45px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '15px' }}>
            Уже есть аккаунт? <Link to="/login" style={{ fontWeight: '500' }}>Войдите!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
