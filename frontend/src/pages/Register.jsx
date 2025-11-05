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
        minHeight: '80vh',
      }}
    >
      <Card title="Регистрация" style={{ width: 400 }}>
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="full_name"
            rules={[{ required: true, message: 'Введите ваше полное имя!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Полное имя"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите ваш email!' },
              { type: 'email', message: 'Введите корректный email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item name="phone">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Телефон (опционально)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
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
            rules={[
              { required: true, message: 'Введите пароль!' },
              { min: 6, message: 'Пароль должен быть минимум 6 символов!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
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
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Уже есть аккаунт? <Link to="/login">Войдите!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
