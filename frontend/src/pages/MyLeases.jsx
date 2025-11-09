import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Modal, Form, DatePicker, InputNumber } from 'antd';
import { leasesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const MyLeases = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);
  const { user } = useAuth();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    setLoading(true);
    try {
      const response = await leasesAPI.getAll({ tenant_id: user.user_id });
      setLeases(response.data);
    } catch (error) {
      message.error('Не удалось загрузить аренды');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (values) => {
    try {
      await leasesAPI.createPayment(selectedLease.lease_id, {
        amount: values.amount,
        payment_date: values.payment_date.toISOString(),
      });
      message.success('Платёж успешно добавлен!');
      setPaymentModalVisible(false);
      form.resetFields();
      fetchLeases();
    } catch (error) {
      message.error('Не удалось добавить платёж');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      pending: 'orange',
      expired: 'red',
      terminated: 'gray',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Активна',
      pending: 'Ожидает',
      expired: 'Истекла',
      terminated: 'Прекращена',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Помещение',
      dataIndex: ['room', 'room_number'],
      key: 'room_number',
      render: (text, record) => `Помещение ${text}`,
    },
    {
      title: 'Период',
      key: 'period',
      render: (_, record) => (
        <div>
          {dayjs(record.start_date).format('DD.MM.YYYY')} - {dayjs(record.end_date).format('DD.MM.YYYY')}
        </div>
      ),
    },
    {
      title: 'Аренда/мес',
      dataIndex: 'monthly_rent',
      key: 'monthly_rent',
      render: (price) => `$${price}`,
    },
    {
      title: 'Депозит',
      dataIndex: 'deposit',
      key: 'deposit',
      render: (price) => `$${price}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          disabled={record.status !== 'active'}
          onClick={() => {
            setSelectedLease(record);
            setPaymentModalVisible(true);
          }}
        >
          Оплатить
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="Мои аренды" style={{ marginBottom: 20 }}>
        <Table
          columns={columns}
          dataSource={leases}
          rowKey="lease_id"
          loading={loading}
          locale={{ emptyText: 'У вас пока нет аренд' }}
        />
      </Card>

      <Modal
        title="Добавить платёж"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handlePayment} layout="vertical">
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму!' }]}
            initialValue={selectedLease?.monthly_rent}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="$"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Дата платежа"
            rules={[{ required: true, message: 'Выберите дату!' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Подтвердить платёж
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyLeases;
