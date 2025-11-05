import React, { useState, useEffect } from 'react';
import {
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
  InboxOutlined,
} from '@ant-design/icons';
import {
  roomsAPI,
  categoriesAPI,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const { Dragger } = Upload;

const LandlordPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [newRoomFileList, setNewRoomFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, categoriesRes] = await Promise.all([
        roomsAPI.getAll({}),
        categoriesAPI.getAll(),
      ]);
      setRooms(roomsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      message.error('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      let roomId;
      if (editingRoom) {
        await roomsAPI.update(editingRoom.room_id, values);
        roomId = editingRoom.room_id;
        message.success('Помещение успешно обновлено');
      } else {
        const response = await roomsAPI.create(values);
        roomId = response.data.room_id;
        message.success('Помещение успешно создано');

        // Upload photos if any
        if (newRoomFileList.length > 0) {
          const loadingMessage = message.loading('Загрузка фотографий...', 0);
          try {
            for (const file of newRoomFileList) {
              const formData = new FormData();
              const actualFile = file.originFileObj || file;
              formData.append('file', actualFile);
              await roomsAPI.uploadPhoto(roomId, formData);
            }
            loadingMessage();
            message.success(`Загружено ${newRoomFileList.length} фото!`);
          } catch (error) {
            loadingMessage();
            message.error('Помещение создано, но не удалось загрузить фото');
          }
        }
      }

      setModalVisible(false);
      form.resetFields();
      setEditingRoom(null);
      setNewRoomFileList([]);
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

  const newRoomUploadProps = {
    multiple: true,
    fileList: newRoomFileList,
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
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setNewRoomFileList(newFileList);
    },
    onRemove: (file) => {
      const index = newRoomFileList.indexOf(file);
      const newFileList = newRoomFileList.slice();
      newFileList.splice(index, 1);
      setNewRoomFileList(newFileList);
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
      title: 'Категория',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    { title: 'Площадь (м²)', dataIndex: 'area', key: 'area' },
    {
      title: 'Цена/мес',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      render: (price) => `${price} ₽`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const labels = { available: 'Доступно', rented: 'Арендовано', maintenance: 'Обслуживание' };
        return labels[status] || status;
      }
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
            size="small"
          >
            Изменить
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedRoom(record);
              setPhotoModalVisible(true);
            }}
            size="small"
          >
            Фото
          </Button>
          <Popconfirm
            title="Удалить это помещение?"
            onConfirm={() => handleDelete(record.room_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Панель арендодателя - Мои помещения</h1>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingRoom(null);
          form.resetFields();
          setNewRoomFileList([]);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
        size="large"
      >
        Добавить помещение
      </Button>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="room_id"
        loading={loading}
        scroll={{ x: 1000 }}
      />

      {/* Room Modal */}
      <Modal
        title={editingRoom ? 'Редактировать помещение' : 'Добавить помещение'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
          setNewRoomFileList([]);
        }}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="category_id"
            label="Категория помещения"
            rules={[{ required: true, message: 'Выберите категорию!' }]}
          >
            <Select placeholder="Выберите категорию" size="large">
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
            <Input placeholder="Например: 101, 2A, офис 5" size="large" />
          </Form.Item>

          <Form.Item
            name="area"
            label="Площадь (м²)"
            rules={[{ required: true, message: 'Введите площадь!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="50" size="large" />
          </Form.Item>

          <Form.Item
            name="price_per_month"
            label="Цена в месяц (₽)"
            rules={[{ required: true, message: 'Введите цену!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="50000" size="large" />
          </Form.Item>

          <Form.Item name="floor" label="Этаж">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="3" size="large" />
          </Form.Item>

          <Form.Item name="status" label="Статус" initialValue="available">
            <Select size="large">
              <Select.Option value="available">Доступно</Select.Option>
              <Select.Option value="rented">Арендовано</Select.Option>
              <Select.Option value="maintenance">Обслуживание</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} placeholder="Опишите помещение..." />
          </Form.Item>

          {!editingRoom && (
            <Form.Item label="Фотографии (можно добавить позже)">
              <Upload {...newRoomUploadProps}>
                <Button icon={<PlusOutlined />} block>
                  Добавить фото
                </Button>
              </Upload>
            </Form.Item>
          )}

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
        width={800}
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
