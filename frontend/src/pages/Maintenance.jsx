import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { maintenanceAPI, leasesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRequests();
    fetchLeases();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await maintenanceAPI.getAll({ tenant_id: user.user_id });
      setRequests(response.data);
    } catch (error) {
      message.error('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeases = async () => {
    try {
      const response = await leasesAPI.getAll({ tenant_id: user.user_id, status: 'active' });
      setLeases(response.data);
    } catch (error) {
      console.error('Не удалось загрузить аренды');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await maintenanceAPI.create(values);
      message.success('Заявка успешно создана!');
      setModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      message.error('Не удалось создать заявку');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Завершена',
      cancelled: 'Отменена',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'orange',
      high: 'red',
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
    };
    return texts[priority] || priority;
  };

  const columns = [
    {
      title: 'Помещение',
      dataIndex: ['lease', 'room', 'room_number'],
      key: 'room_number',
      render: (text) => `Помещение ${text}`,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{getPriorityText(priority)}</Tag>
      ),
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
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <div>
      <Card
        title="Заявки на обслуживание"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Создать заявку
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="request_id"
          loading={loading}
          locale={{ emptyText: 'У вас пока нет заявок' }}
        />
      </Card>

      <Modal
        title="Создать заявку на обслуживание"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="lease_id"
            label="Выберите помещение"
            rules={[{ required: true, message: 'Выберите помещение!' }]}
          >
            <Select placeholder="Выберите помещение из ваших аренд">
              {leases.map((lease) => (
                <Select.Option key={lease.lease_id} value={lease.lease_id}>
                  Помещение {lease.room.room_number} - {lease.room.building?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание проблемы"
            rules={[{ required: true, message: 'Опишите проблему!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Опишите подробно что требует обслуживания или ремонта"
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Приоритет"
            initialValue="medium"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="low">Низкий</Select.Option>
              <Select.Option value="medium">Средний</Select.Option>
              <Select.Option value="high">Высокий</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Создать заявку
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Maintenance;
