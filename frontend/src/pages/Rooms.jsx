import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Slider,
  Tag,
  Image,
  Empty,
  Space,
  Rate,
  message,
  Modal,
  Form,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  EnvironmentOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { roomsAPI, favoritesAPI, reviewsAPI, leasesAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'available',
    minPrice: 0,
    maxPrice: 100000,
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [leaseModalVisible, setLeaseModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
    fetchCategories();
    if (user) {
      fetchFavorites();
    }
  }, [filters, user]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomsAPI.getAll(filters);
      setRooms(response.data);
    } catch (error) {
      message.error('Не удалось загрузить помещения');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data.map((f) => f.room_id));
    } catch (error) {
      console.error('Failed to fetch favorites');
    }
  };

  const toggleFavorite = async (roomId) => {
    if (!user) {
      message.warning('Пожалуйста, войдите, чтобы добавить в избранное');
      return;
    }

    try {
      const isFavorite = favorites.includes(roomId);
      if (isFavorite) {
        const favoriteItem = await favoritesAPI.getAll();
        const favorite = favoriteItem.data.find((f) => f.room_id === roomId);
        await favoritesAPI.remove(favorite.favorite_id);
        setFavorites(favorites.filter((id) => id !== roomId));
        message.success('Удалено из избранного');
      } else {
        await favoritesAPI.add({ room_id: roomId });
        setFavorites([...favorites, roomId]);
        message.success('Добавлено в избранное');
      }
    } catch (error) {
      message.error('Не удалось обновить избранное');
    }
  };

  const handleLeaseSubmit = async (values) => {
    try {
      await leasesAPI.create({
        room_id: selectedRoom.room_id,
        tenant_id: user.user_id,
        start_date: values.dates[0].toISOString(),
        end_date: values.dates[1].toISOString(),
        monthly_rent: selectedRoom.price_per_month,
        deposit: selectedRoom.price_per_month * 2,
      });
      message.success('Аренда успешно оформлена!');
      setLeaseModalVisible(false);
      fetchRooms();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Не удалось оформить аренду');
    }
  };

  const handleReviewSubmit = async (values) => {
    try {
      await reviewsAPI.create({
        room_id: selectedRoom.room_id,
        rating: values.rating,
        comment: values.comment,
      });
      message.success('Отзыв успешно добавлен!');
      setReviewModalVisible(false);
    } catch (error) {
      message.error('Не удалось добавить отзыв');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      occupied: 'red',
      maintenance: 'orange',
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Категория"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, category_id: value })}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Статус"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Select.Option value="available">Доступно</Select.Option>
              <Select.Option value="occupied">Занято</Select.Option>
              <Select.Option value="maintenance">Обслуживание</Select.Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ padding: '0 20px' }}>
              <span>Диапазон цен: </span>
              <Slider
                range
                min={0}
                max={100000}
                step={1000}
                value={[filters.minPrice, filters.maxPrice]}
                onChange={(value) =>
                  setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] })
                }
              />
            </div>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>Загрузка...</div>
      ) : rooms.length === 0 ? (
        <Empty description="Помещения не найдены" />
      ) : (
        <Row gutter={[16, 16]}>
          {rooms.map((room) => (
            <Col key={room.room_id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                cover={
                  room.photos && room.photos.length > 0 ? (
                    <Image
                      alt={room.room_number}
                      src={getImageUrl(room.photos[0].photo_url)}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Нет изображения
                    </div>
                  )
                }
                actions={
                  user && user.role !== 'admin'
                    ? [
                        <Button
                          type="text"
                          icon={
                            favorites.includes(room.room_id) ? (
                              <HeartFilled style={{ color: 'red' }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={() => toggleFavorite(room.room_id)}
                        />,
                        <Button
                          type="primary"
                          disabled={room.status !== 'available'}
                          onClick={() => {
                            setSelectedRoom(room);
                            setLeaseModalVisible(true);
                          }}
                        >
                          Арендовать
                        </Button>,
                        <Button
                          onClick={() => {
                            setSelectedRoom(room);
                            setReviewModalVisible(true);
                          }}
                        >
                          Отзыв
                        </Button>,
                      ]
                    : []
                }
              >
                <Card.Meta
                  title={
                    <Space>
                      Помещение {room.room_number}
                      <Tag color={getStatusColor(room.status)}>
                        {room.status === 'available' ? 'Доступно' : room.status === 'occupied' ? 'Занято' : 'Обслуживание'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <p>{room.description}</p>
                      <p>
                        <DollarOutlined /> ${room.price_per_month}/мес
                      </p>
                      <p>Площадь: {room.area} м²</p>
                      <p>Этаж: {room.floor}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Lease Modal */}
      <Modal
        title="Оформить аренду"
        open={leaseModalVisible}
        onCancel={() => setLeaseModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleLeaseSubmit} layout="vertical">
          <Form.Item
            name="dates"
            label="Период аренды"
            rules={[{ required: true, message: 'Пожалуйста, выберите период аренды' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <p>Ежемесячная аренда: ${selectedRoom?.price_per_month}</p>
            <p>Депозит: ${selectedRoom?.price_per_month * 2}</p>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Подтвердить аренду
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Добавить отзыв"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleReviewSubmit} layout="vertical">
          <Form.Item
            name="rating"
            label="Рейтинг"
            rules={[{ required: true, message: 'Пожалуйста, укажите рейтинг' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Отправить отзыв
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rooms;
