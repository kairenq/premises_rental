import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Empty, Tag, Image } from 'antd';
import { HeartFilled, DollarOutlined } from '@ant-design/icons';
import { favoritesAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (error) {
      message.error('Не удалось загрузить избранное');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await favoritesAPI.remove(favoriteId);
      message.success('Удалено из избранного');
      fetchFavorites();
    } catch (error) {
      message.error('Не удалось удалить из избранного');
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

  const getStatusText = (status) => {
    const texts = {
      available: 'Доступно',
      occupied: 'Занято',
      maintenance: 'Обслуживание',
    };
    return texts[status] || status;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Избранное</h1>

      {favorites.length === 0 ? (
        <Card>
          <Empty description="У вас пока нет избранных помещений" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {favorites.map((favorite) => (
            <Col key={favorite.favorite_id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                cover={
                  favorite.room.photos && favorite.room.photos.length > 0 ? (
                    <Image
                      alt={favorite.room.room_number}
                      src={getImageUrl(favorite.room.photos[0].photo_url)}
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
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<HeartFilled style={{ color: 'red' }} />}
                    onClick={() => removeFavorite(favorite.favorite_id)}
                  >
                    Удалить
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      Помещение {favorite.room.room_number}
                      <Tag color={getStatusColor(favorite.room.status)} style={{ marginLeft: 8 }}>
                        {getStatusText(favorite.room.status)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p>{favorite.room.description}</p>
                      <p>
                        <DollarOutlined /> ${favorite.room.price_per_month}/мес
                      </p>
                      <p>Площадь: {favorite.room.area} м²</p>
                      <p>Этаж: {favorite.room.floor}</p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        Добавлено: {new Date(favorite.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Favorites;
