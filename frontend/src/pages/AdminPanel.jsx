import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Card, Row, Col, Statistic, InputNumber } from 'antd';
import { UserOutlined, HomeOutlined, ShopOutlined, BankOutlined, TagOutlined, PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { roomsAPI, companiesAPI, categoriesAPI, statsAPI, buildingsAPI } from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({});

  // Buildings (for dropdowns only)
  const [buildings, setBuildings] = useState([]);

  // Rooms
  const [rooms, setRooms] = useState([]);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm] = Form.useForm();

  // Companies
  const [companies, setCompanies] = useState([]);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm] = Form.useForm();

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm] = Form.useForm();

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
    else if (activeTab === 'companies') fetchCompanies();
    else if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  // === STATS ===
  const fetchStats = async () => {
    try {
      const response = await statsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      message.error('Не удалось загрузить статистику');
    }
  };

  // === ROOMS ===
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomsAPI.getAll({});
      setRooms(response.data);

      // Fetch buildings and categories for dropdowns
      const buildingsRes = await buildingsAPI.getAll({});
      setBuildings(buildingsRes.data);

      const categoriesRes = await categoriesAPI.getAll();
      setCategories(categoriesRes.data);
    } catch (error) {
      message.error('Не удалось загрузить помещения');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomEdit = (room) => {
    setEditingRoom(room);
    roomForm.setFieldsValue(room);
    setRoomModalVisible(true);
  };

  const handleRoomDelete = async (roomId) => {
    try {
      await roomsAPI.delete(roomId);
      message.success('Помещение удалено');
      fetchRooms();
    } catch (error) {
      message.error('Не удалось удалить помещение');
    }
  };

  const handleRoomSubmit = async (values) => {
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom.room_id, values);
        message.success('Помещение обновлено');
      } else {
        await roomsAPI.create(values);
        message.success('Помещение создано');
      }
      setRoomModalVisible(false);
      setEditingRoom(null);
      roomForm.resetFields();
      fetchRooms();
    } catch (error) {
      message.error('Не удалось сохранить помещение');
    }
  };

  const roomColumns = [
    { title: 'ID', dataIndex: 'room_id', key: 'room_id', width: 70 },
    { title: '№', dataIndex: 'room_number', key: 'room_number', width: 80 },
    { title: 'Здание', dataIndex: ['building', 'name'], key: 'building' },
    { title: 'Категория', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Площадь', dataIndex: 'area', key: 'area', width: 100, render: (area) => `${area} м²` },
    { title: 'Цена/мес', dataIndex: 'price_per_month', key: 'price', width: 120, render: (price) => `${price} ₽` },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = { available: 'green', rented: 'orange', maintenance: 'red' };
        const labels = { available: 'Доступно', rented: 'Арендовано', maintenance: 'Обслуживание' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleRoomEdit(record)} size="small">
            Изменить
          </Button>
          <Popconfirm
            title="Удалить помещение?"
            onConfirm={() => handleRoomDelete(record.room_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // === COMPANIES ===
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

  const handleCompanyEdit = (company) => {
    setEditingCompany(company);
    companyForm.setFieldsValue(company);
    setCompanyModalVisible(true);
  };

  const handleCompanyDelete = async (companyId) => {
    try {
      await companiesAPI.delete(companyId);
      message.success('Компания удалена');
      fetchCompanies();
    } catch (error) {
      message.error('Не удалось удалить компанию');
    }
  };

  const handleCompanySubmit = async (values) => {
    try {
      if (editingCompany) {
        await companiesAPI.update(editingCompany.company_id, values);
        message.success('Компания обновлена');
      } else {
        await companiesAPI.create(values);
        message.success('Компания создана');
      }
      setCompanyModalVisible(false);
      setEditingCompany(null);
      companyForm.resetFields();
      fetchCompanies();
    } catch (error) {
      message.error('Не удалось сохранить компанию');
    }
  };

  const companyColumns = [
    { title: 'ID', dataIndex: 'company_id', key: 'company_id', width: 70 },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'ИНН', dataIndex: 'tax_id', key: 'tax_id' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Контактное лицо', dataIndex: 'contact_person', key: 'contact_person' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleCompanyEdit(record)} size="small">
            Изменить
          </Button>
          <Popconfirm
            title="Удалить компанию?"
            onConfirm={() => handleCompanyDelete(record.company_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // === CATEGORIES ===
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      message.error('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setCategoryModalVisible(true);
  };

  const handleCategoryDelete = async (categoryId) => {
    try {
      await categoriesAPI.delete(categoryId);
      message.success('Категория удалена');
      fetchCategories();
    } catch (error) {
      message.error('Не удалось удалить категорию');
    }
  };

  const handleCategorySubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.category_id, values);
        message.success('Категория обновлена');
      } else {
        await categoriesAPI.create(values);
        message.success('Категория создана');
      }
      setCategoryModalVisible(false);
      setEditingCategory(null);
      categoryForm.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('Не удалось сохранить категорию');
    }
  };

  const categoryColumns = [
    { title: 'ID', dataIndex: 'category_id', key: 'category_id', width: 70 },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleCategoryEdit(record)} size="small">
            Изменить
          </Button>
          <Popconfirm
            title="Удалить категорию?"
            onConfirm={() => handleCategoryDelete(record.category_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Панель администратора</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* STATS TAB */}
        <TabPane tab={<span><BarChartOutlined />Статистика</span>} key="stats">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Всего пользователей" value={stats.total_users || 0} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Зданий" value={stats.total_buildings || 0} prefix={<BankOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Помещений" value={stats.total_rooms || 0} prefix={<ShopOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Доступно помещений" value={stats.available_rooms || 0} prefix={<HomeOutlined />} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* ROOMS TAB */}
        <TabPane tab={<span><ShopOutlined />Помещения</span>} key="rooms">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRoom(null);
              roomForm.resetFields();
              setRoomModalVisible(true);
            }}
            style={{ marginBottom: 16 }}
          >
            Добавить помещение
          </Button>
          <Table
            columns={roomColumns}
            dataSource={rooms}
            loading={loading}
            rowKey="room_id"
            scroll={{ x: 1200 }}
          />
        </TabPane>

        {/* COMPANIES TAB */}
        <TabPane tab={<span><BankOutlined />Компании</span>} key="companies">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCompany(null);
              companyForm.resetFields();
              setCompanyModalVisible(true);
            }}
            style={{ marginBottom: 16 }}
          >
            Добавить компанию
          </Button>
          <Table
            columns={companyColumns}
            dataSource={companies}
            loading={loading}
            rowKey="company_id"
            scroll={{ x: 1000 }}
          />
        </TabPane>

        {/* CATEGORIES TAB */}
        <TabPane tab={<span><TagOutlined />Категории</span>} key="categories">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              categoryForm.resetFields();
              setCategoryModalVisible(true);
            }}
            style={{ marginBottom: 16 }}
          >
            Добавить категорию
          </Button>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            loading={loading}
            rowKey="category_id"
          />
        </TabPane>
      </Tabs>

      {/* ROOM MODAL */}
      <Modal
        title={editingRoom ? 'Редактировать помещение' : 'Добавить помещение'}
        open={roomModalVisible}
        onCancel={() => {
          setRoomModalVisible(false);
          setEditingRoom(null);
          roomForm.resetFields();
        }}
        onOk={() => roomForm.submit()}
        width={700}
      >
        <Form form={roomForm} onFinish={handleRoomSubmit} layout="vertical">
          <Form.Item name="room_number" label="Номер помещения" rules={[{ required: true, message: 'Введите номер' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="building_id" label="Здание" rules={[{ required: true, message: 'Выберите здание' }]}>
            <Select>
              {buildings.map(b => <Option key={b.building_id} value={b.building_id}>{b.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="category_id" label="Категория" rules={[{ required: true, message: 'Выберите категорию' }]}>
            <Select>
              {categories.map(c => <Option key={c.category_id} value={c.category_id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="floor" label="Этаж" rules={[{ required: true, message: 'Введите этаж' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="area" label="Площадь (м²)" rules={[{ required: true, message: 'Введите площадь' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="price_per_month" label="Цена за месяц (₽)" rules={[{ required: true, message: 'Введите цену' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Статус" rules={[{ required: true, message: 'Выберите статус' }]}>
            <Select>
              <Option value="available">Доступно</Option>
              <Option value="rented">Арендовано</Option>
              <Option value="maintenance">Обслуживание</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* COMPANY MODAL */}
      <Modal
        title={editingCompany ? 'Редактировать компанию' : 'Добавить компанию'}
        open={companyModalVisible}
        onCancel={() => {
          setCompanyModalVisible(false);
          setEditingCompany(null);
          companyForm.resetFields();
        }}
        onOk={() => companyForm.submit()}
        width={700}
      >
        <Form form={companyForm} onFinish={handleCompanySubmit} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tax_id" label="ИНН" rules={[{ required: true, message: 'Введите ИНН' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Адрес" rules={[{ required: true, message: 'Введите адрес' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact_person" label="Контактное лицо" rules={[{ required: true, message: 'Введите контактное лицо' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* CATEGORY MODAL */}
      <Modal
        title={editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
          categoryForm.resetFields();
        }}
        onOk={() => categoryForm.submit()}
      >
        <Form form={categoryForm} onFinish={handleCategorySubmit} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
