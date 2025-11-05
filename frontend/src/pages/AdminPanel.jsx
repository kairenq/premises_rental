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
      <h1>Admin Panel</h1>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'rooms', label: 'Rooms', children: <RoomsTab /> },
          { key: 'companies', label: 'Companies', children: <CompaniesTab /> },
          { key: 'buildings', label: 'Buildings', children: <BuildingsTab /> },
          { key: 'categories', label: 'Categories', children: <CategoriesTab /> },
          { key: 'leases', label: 'Leases', children: <LeasesTab /> },
          { key: 'maintenance', label: 'Maintenance', children: <MaintenanceTab /> },
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
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.room_id, values);
        message.success('Room updated successfully');
      } else {
        await roomsAPI.create(values);
        message.success('Room created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRoom(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await roomsAPI.delete(id);
      message.success('Room deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'room_id', key: 'room_id' },
    { title: 'Room Number', dataIndex: 'room_number', key: 'room_number' },
    { title: 'Floor', dataIndex: 'floor', key: 'floor' },
    { title: 'Area (m²)', dataIndex: 'area', key: 'area' },
    {
      title: 'Price/Month',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      render: (price) => `$${price}`,
    },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this room?"
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
        Add Room
      </Button>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="room_id"
        loading={loading}
      />

      <Modal
        title={editingRoom ? 'Edit Room' : 'Add Room'}
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
            label="Building"
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
            label="Category"
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
            label="Room Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="floor" label="Floor">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="area" label="Area (m²)">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price_per_month"
            label="Price per Month"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} prefix="$" />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="available">
            <Select>
              <Select.Option value="available">Available</Select.Option>
              <Select.Option value="occupied">Occupied</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingRoom ? 'Update' : 'Create'}
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
      message.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.company_id, values);
        message.success('Company updated successfully');
      } else {
        await companiesAPI.create(values);
        message.success('Company created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await companiesAPI.delete(id);
      message.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      message.error('Failed to delete company');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'company_id', key: 'company_id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Tax ID', dataIndex: 'tax_id', key: 'tax_id' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Actions',
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
            title="Delete this company?"
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
        Add Company
      </Button>

      <Table
        columns={columns}
        dataSource={companies}
        rowKey="company_id"
        loading={loading}
      />

      <Modal
        title={editingCompany ? 'Edit Company' : 'Add Company'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCompany(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tax_id" label="Tax ID">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="contact_person" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCompany ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Simplified tabs for Buildings, Categories, Leases, Maintenance
const BuildingsTab = () => <div>Buildings management (similar to Companies)</div>;
const CategoriesTab = () => <div>Categories management</div>;
const LeasesTab = () => <div>Leases management</div>;
const MaintenanceTab = () => <div>Maintenance requests management</div>;

export default AdminPanel;
