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
  Card,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  buildingsAPI,
  roomsAPI,
  categoriesAPI,
  companiesAPI,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const { Dragger } = Upload;

const LandlordPanel = () => {
  const [activeTab, setActiveTab] = useState('buildings');

  return (
    <div>
      <h1>Панель арендодателя</h1>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'buildings', label: 'Мои здания', children: <BuildingsTab /> },
          { key: 'rooms', label: 'Мои помещения', children: <RoomsTab /> },
        ]}
      />
    </div>
  );
};

// Buildings Tab
const BuildingsTab = () => {
  const [buildings, setBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [buildingsRes, companiesRes] = await Promise.all([
        buildingsAPI.getAll({}),
        companiesAPI.getAll({}),
      ]);
      setBuildings(buildingsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      message.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBuilding) {
        await buildingsAPI.update(editingBuilding.building_id, values);
        message.success('Здание успешно обновлено');
      } else {
        await buildingsAPI.create(values);
        message.success('Здание успешно создано');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingBuilding(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Операция не удалась');
    }
  };

  const handleDelete = async (id) => {
    try {
      await buildingsAPI.delete(id);
      message.success('Здание успешно удалено');
      fetchData();
    } catch (error) {
      message.error('Не удалось удалить здание');
    }
  };

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Адрес', dataIndex: 'address', key: 'address' },
    { title: 'Этажей', dataIndex: 'total_floors', key: 'total_floors' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBuilding(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Удалить это здание?"
            onConfirm={() => handleDelete(record.building_id)}
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
          setEditingBuilding(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Добавить здание
      </Button>

      <Table
        columns={columns}
        dataSource={buildings}
        rowKey="building_id"
        loading={loading}
      />

      <Modal
        title={editingBuilding ? 'Редактировать здание' : 'Добавить здание'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBuilding(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="company_id"
            label="Компания"
            rules={[{ required: true, message: 'Выберите компанию!' }]}
          >
            <Select placeholder="Выберите компанию">
              {companies.map((c) => (
                <Select.Option key={c.company_id} value={c.company_id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Название здания"
            rules={[{ required: true, message: 'Введите название!' }]}
          >
            <Input placeholder="Например: Бизнес-центр Альфа" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Адрес"
            rules={[{ required: true, message: 'Введите адрес!' }]}
          >
            <Input placeholder="Например: ул. Ленина, 123" />
          </Form.Item>

          <Form.Item name="total_floors" label="Количество этажей">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="10" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} placeholder="Опишите здание..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {editingBuilding ? 'Обновить' : 'Создать'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Rooms Tab with Photo Upload
const RoomsTab = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [fileList, setFileList] = useState([]);
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

  const uploadProps = {
    multiple: true,
    fileList: fileList,
    listType: "picture-card",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Можно загружать только изображения!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Размер файла не должен превышать 5MB!');
        return Upload.LIST_IGNORE;
      }
      // Prevent auto upload
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  const handlePhotoUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Выберите хотя бы одно фото!');
      return;
    }

    const loadingMessage = message.loading('Загрузка фотографий...', 0);

    try {
      let successCount = 0;
      for (const file of fileList) {
        const formData = new FormData();
        // file.originFileObj содержит настоящий файл
        const actualFile = file.originFileObj || file;
        formData.append('file', actualFile);

        await roomsAPI.uploadPhoto(selectedRoom.room_id, formData);
        successCount++;
      }
      loadingMessage();
      message.success(`Загружено ${successCount} фото!`);
      setPhotoModalVisible(false);
      setFileList([]);
      fetchData();
    } catch (error) {
      loadingMessage();
      message.error('Не удалось загрузить фото: ' + (error.response?.data?.detail || error.message));
      console.error('Upload error:', error);
    }
  };

  const columns = [
    { title: 'Номер', dataIndex: 'room_number', key: 'room_number' },
    {
      title: 'Здание',
      dataIndex: ['building', 'name'],
      key: 'building',
    },
    { title: 'Этаж', dataIndex: 'floor', key: 'floor' },
    { title: 'Площадь (м²)', dataIndex: 'area', key: 'area' },
    {
      title: 'Цена/мес',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      render: (price) => `$${price}`,
    },
    {
      title: 'Фото',
      dataIndex: 'photos',
      key: 'photos',
      render: (photos) => (
        <span>{photos?.length || 0} шт</span>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRoom(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              setSelectedRoom(record);
              setPhotoModalVisible(true);
            }}
          >
            Фото
          </Button>
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

      {/* Room Modal */}
      <Modal
        title={editingRoom ? 'Редактировать помещение' : 'Добавить помещение'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="building_id"
            label="Здание"
            rules={[{ required: true, message: 'Выберите здание!' }]}
          >
            <Select placeholder="Выберите здание">
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
            rules={[{ required: true, message: 'Выберите категорию!' }]}
          >
            <Select placeholder="Выберите категорию">
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
            rules={[{ required: true, message: 'Введите номер!' }]}
          >
            <Input placeholder="Например: 101, 2A, офис 5" />
          </Form.Item>

          <Form.Item name="floor" label="Этаж">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="3" />
          </Form.Item>

          <Form.Item name="area" label="Площадь (м²)">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="50" />
          </Form.Item>

          <Form.Item
            name="price_per_month"
            label="Цена в месяц ($)"
            rules={[{ required: true, message: 'Введите цену!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="1000" />
          </Form.Item>

          <Form.Item name="status" label="Статус" initialValue="available">
            <Select>
              <Select.Option value="available">Доступно</Select.Option>
              <Select.Option value="occupied">Занято</Select.Option>
              <Select.Option value="maintenance">Обслуживание</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} placeholder="Опишите помещение..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {editingRoom ? 'Обновить' : 'Создать'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal
        title={`Загрузка фото для помещения ${selectedRoom?.room_number}`}
        open={photoModalVisible}
        onCancel={() => {
          setPhotoModalVisible(false);
          setFileList([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => setPhotoModalVisible(false)}>
            Отмена
          </Button>,
          <Button key="upload" type="primary" onClick={handlePhotoUpload}>
            Загрузить
          </Button>,
        ]}
        width={700}
      >
        {selectedRoom && selectedRoom.photos && selectedRoom.photos.length > 0 && (
          <Card title="Текущие фото" style={{ marginBottom: 16 }}>
            <Image.PreviewGroup>
              <Space wrap>
                {selectedRoom.photos.map((photo) => (
                  <div key={photo.photo_id} style={{ position: 'relative' }}>
                    <Image
                      width={100}
                      height={100}
                      src={getImageUrl(photo.photo_url)}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                      }}
                      onClick={async () => {
                        try {
                          await roomsAPI.deletePhoto(photo.photo_id);
                          message.success('Фото удалено');
                          fetchData();
                        } catch (error) {
                          message.error('Не удалось удалить фото');
                        }
                      }}
                    />
                  </div>
                ))}
              </Space>
            </Image.PreviewGroup>
          </Card>
        )}

        <Dragger {...uploadProps} style={{ padding: 20 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 16 }}>
            Нажмите или перетащите файлы сюда
          </p>
          <p className="ant-upload-hint">
            Поддерживаются изображения до 5MB. Можно загрузить несколько фото сразу.
          </p>
        </Dragger>
      </Modal>
    </div>
  );
};

export default LandlordPanel;
