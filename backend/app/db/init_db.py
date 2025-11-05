from sqlalchemy.orm import Session
from ..models.models import User, Company, RoomCategory
from ..core.security import get_password_hash


def init_database(db: Session):
    """Initialize database with test data."""

    print("🔍 Checking if database needs initialization...")

    # Check if data already exists
    existing_categories = db.query(RoomCategory).count()
    existing_companies = db.query(Company).count()
    existing_users = db.query(User).filter(User.email.in_(['landlord@test.com', 'user@test.com'])).count()

    # Create categories if not exist
    if existing_categories == 0:
        print("📦 Creating categories...")
        categories = [
            RoomCategory(name="Офисы", description="Офисные помещения"),
            RoomCategory(name="Торговые площади", description="Помещения для торговли"),
            RoomCategory(name="Склады", description="Складские помещения"),
            RoomCategory(name="Коворкинг", description="Коворкинг-пространства"),
            RoomCategory(name="Конференц-залы", description="Помещения для мероприятий"),
        ]
        db.add_all(categories)
        print(f"✅ Created {len(categories)} categories")
    else:
        print(f"✅ Categories already exist ({existing_categories})")

    # Create companies if not exist
    if existing_companies == 0:
        print("🏢 Creating companies...")
        companies = [
            Company(
                name="ООО 'БизнесЦентр'",
                tax_id="1234567890",
                address="ул. Ленина, 1",
                phone="+7 (495) 123-45-67",
                email="info@businesscenter.ru",
                contact_person="Иванов Иван Иванович",
                description="Управляющая компания бизнес-центров"
            ),
            Company(
                name="АО 'ТоргПлощадь'",
                tax_id="0987654321",
                address="пр. Мира, 50",
                phone="+7 (495) 765-43-21",
                email="rent@torgploshad.ru",
                contact_person="Петров Петр Петрович",
                description="Торговая недвижимость"
            ),
            Company(
                name="ООО 'ОфисГрупп'",
                tax_id="5555666677",
                address="ул. Тверская, 10",
                phone="+7 (495) 111-22-33",
                email="office@officegroup.ru",
                contact_person="Сидорова Анна Владимировна",
                description="Современные офисные пространства"
            ),
        ]
        db.add_all(companies)
        print(f"✅ Created {len(companies)} companies")
    else:
        print(f"✅ Companies already exist ({existing_companies})")

    # Create test users if not exist
    if existing_users < 2:
        print("👥 Creating test users...")

        # Check and create landlord
        landlord = db.query(User).filter(User.email == "landlord@test.com").first()
        if not landlord:
            landlord = User(
                full_name="Арендодатель Тестовый",
                email="landlord@test.com",
                phone="+7 (900) 111-11-11",
                role="landlord",
                password_hash=get_password_hash("landlord123")
            )
            db.add(landlord)
            print("✅ Created landlord user: landlord@test.com / landlord123")
        else:
            print("✅ Landlord user already exists")

        # Check and create regular user
        user = db.query(User).filter(User.email == "user@test.com").first()
        if not user:
            user = User(
                full_name="Пользователь Тестовый",
                email="user@test.com",
                phone="+7 (900) 222-22-22",
                role="user",
                password_hash=get_password_hash("user123")
            )
            db.add(user)
            print("✅ Created regular user: user@test.com / user123")
        else:
            print("✅ Regular user already exists")
    else:
        print(f"✅ Test users already exist ({existing_users})")

    # Commit all changes
    try:
        db.commit()
        print("🎉 Database initialization completed successfully!")
        print("\n📋 Test credentials:")
        print("   Landlord: landlord@test.com / landlord123")
        print("   User:     user@test.com / user123")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during initialization: {e}")
