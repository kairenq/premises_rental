import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Upload,
  Popconfirm,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  roomsAPI,
  companiesAPI,
  buildingsAPI,
  categoriesAPI,
  leasesAPI,
  maintenanceAPI,
} from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('rooms');

  return (
    <div>
      <h1>Панель администратора</h1>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'rooms', label: 'Помещения', children: <RoomsTab /> },
          { key: 'companies', label: 'Компании', children: <CompaniesTab /> },
          { key: 'buildings', label: 'Здания', children: <BuildingsTab /> },
          { key: 'categories', label: 'Категории', children: <CategoriesTab /> },
          { key: 'leases', label: 'Аренды', children: <LeasesTab /> },
          { key: 'maintenance', label: 'Обслуживание', children: <MaintenanceTab /> },
        ]}
      />
    </div>
  );
};

// Rooms Tab
const RoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, buildingsRes, categoriesRes] = await Promise.all([
        roomsAPI.getAll({}),
        buildingsAPI.getAll({}),
        categoriesAPI.getAll(),
      ]);
      setRooms(roomsRes.data);
      setBuildings(buildingsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      message.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.room_id, values);
        message.success('Помещение успешно обновлено');
      } else {
        await roomsAPI.create(values);
        message.success('Помещение успешно создано');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRoom(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Операция не удалась');
    }
  };

  const handleDelete = async (id) => {
    try {
      await roomsAPI.delete(id);
      message.success('Помещение успешно удалено');
      fetchData();
    } catch (error) {
      message.error('Не удалось удалить помещение');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'room_id', key: 'room_id' },
    { title: 'Номер помещения', dataIndex: 'room_number', key: 'room_number' },
    { title: 'Этаж', dataIndex: 'floor', key: 'floor' },
    { title: 'Площадь (м²)', dataIndex: 'area', key: 'area' },
    {
      title: 'Цена/мес',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      render: (price) => `$${price}`,
    },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить это помещение?"
            onConfirm={() => handleDelete(record.room_id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingRoom(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Добавить помещение
      </Button>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="room_id"
        loading={loading}
      />

      <Modal
        title={editingRoom ? 'Редактировать помещение' : 'Добавить помещение'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="building_id"
            label="Здание"
            rules={[{ required: true }]}
          >
            <Select>
              {buildings.map((b) => (
                <Select.Option key={b.building_id} value={b.building_id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Категория"
            rules={[{ required: true }]}
          >
            <Select>
              {categories.map((c) => (
                <Select.Option key={c.category_id} value={c.category_id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="room_number"
            label="Номер помещения"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="floor" label="Этаж">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="area" label="Площадь (м²)">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price_per_month"
            label="Цена в месяц"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} prefix="$" />
          </Form.Item>

          <Form.Item name="status" label="Статус" initialValue="available">
            <Select>
              <Select.Option value="available">Доступно</Select.Option>
              <Select.Option value="occupied">Занято</Select.Option>
              <Select.Option value="maintenance">Обслуживание</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingRoom ? 'Обновить' : 'Создать'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Companies Tab
const CompaniesTab = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.getAll({});
      setCompanies(response.data);
    } catch (error) {
      message.error('Не удалось загрузить компании');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.company_id, values);
        message.success('Компания успешно обновлена');
      } else {
        await companiesAPI.create(values);
        message.success('Компания успешно создана');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      message.error('Операция не удалась');
    }
  };

  const handleDelete = async (id) => {
    try {
      await companiesAPI.delete(id);
      message.success('Компания успешно удалена');
      fetchCompanies();
    } catch (error) {
      message.error('Не удалось удалить компанию');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'company_id', key: 'company_id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'ИНН', dataIndex: 'tax_id', key: 'tax_id' },
    { title: 'Адрес', dataIndex: 'address', key: 'address' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCompany(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Удалить эту компанию?"
            onConfirm={() => handleDelete(record.company_id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingCompany(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Добавить компанию
      </Button>

      <Table
        columns={columns}
        dataSource={companies}
        rowKey="company_id"
        loading={loading}
      />

      <Modal
        title={editingCompany ? 'Редактировать компанию' : 'Добавить компанию'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCompany(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tax_id" label="ИНН">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Адрес">
            <Input />
          </Form.Item>
          <Form.Item name="contact_person" label="Контактное лицо">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCompany ? 'Обновить' : 'Создать'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Simplified tabs for Buildings, Categories, Leases, Maintenance
const BuildingsTab = () => <div>Управление зданиями (аналогично компаниям)</div>;
const CategoriesTab = () => <div>Управление категориями</div>;
const LeasesTab = () => <div>Управление арендами</div>;
const MaintenanceTab = () => <div>Управление заявками на обслуживание</div>;

export default AdminPanel;
