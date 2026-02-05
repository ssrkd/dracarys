# Настройка Supabase для Dracarys Store

Это руководство поможет вам настроить Supabase backend для магазина Dracarys.

## Шаг 1: Создание проекта

1. Перейдите на [supabase.com](https://supabase.com) и войдите в аккаунт (или создайте новый)
2. Нажмите "New Project"
3. Заполните форму:
   - **Name**: dracarys-store (или любое другое имя)
   - **Database Password**: создайте надежный пароль (сохраните его!)
   - **Region**: выберите ближайший регион
   - **Pricing Plan**: Free (достаточно для демо)
4. Нажмите "Create new project"
5. Дождитесь завершения создания проекта (1-2 минуты)

## Шаг 2: Получение API ключей

1. В боковом меню нажмите на иконку **Settings** (шестеренка)
2. Выберите **API**
3. Скопируйте:
   - **Project URL** (в секции "Config")
   - **anon public** ключ (в секции "Project API keys")
4. Вставьте эти значения в `.env` файл:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Шаг 3: Создание таблицы products

1. В боковом меню нажмите **SQL Editor**
2. Нажмите **New query**
3. Скопируйте и вставьте следующий SQL скрипт:

```sql
-- Создание таблицы products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для улучшения производительности
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Включение Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Политика: Разрешить всем читать товары (публичный доступ)
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Политика: Разрешить вставку (для демо - в продакшне требуется авторизация)
CREATE POLICY "Allow insert for authenticated users" ON products
  FOR INSERT
  WITH CHECK (true);

-- Политика: Разрешить обновление (для демо - в продакшне требуется авторизация)
CREATE POLICY "Allow update for authenticated users" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Политика: Разрешить удаление (для демо - в продакшне требуется авторизация)
CREATE POLICY "Allow delete for authenticated users" ON products
  FOR DELETE
  USING (true);
```

4. Нажмите **Run** (или Ctrl/Cmd + Enter)
5. Убедитесь, что появилось сообщение "Success. No rows returned"

## Шаг 4: Добавление тестовых данных (опционально)

Для тестирования приложения можно добавить несколько товаров:

```sql
-- Вставка тестовых товаров
INSERT INTO products (name, category, price, description, image_url) VALUES
(
  'Минималистичные кроссовки',
  'Shoes',
  25000,
  'Стильные белые кроссовки с черными деталями. Идеально подходят для повседневной носки.',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
),
(
  'Черные джинсы Slim Fit',
  'Pants',
  18000,
  'Классические черные джинсы с зауженным кроем. Высокое качество денима.',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'
),
(
  'Белая базовая футболка',
  'Tops',
  8000,
  'Премиальная хлопковая футболка. Минималистичный дизайн, идеальная посадка.',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
),
(
  'Кожаный рюкзак',
  'Accessories',
  35000,
  'Компактный рюкзак из натуральной кожи. Подходит для ноутбука до 15 дюймов.',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
),
(
  'Серые брюки чинос',
  'Pants',
22000,
  'Универсальные серые брюки для офиса и повседневной носки.',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'
),
(
  'Черная толстовка',
  'Tops',
15000,
  'Уютная толстовка с капюшоном. Премиальный хлопок.',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'
);
```

## Шаг 5: Проверка настроек

1. Перейдите в **Table Editor** в боковом меню
2. Выберите таблицу **products**
3. Убедитесь, что таблица создана и данные отображаются (если вы добавили тестовые данные)

## 🔒 Безопасность для продакшна

**⚠️ ВАЖНО**: Текущие RLS политики разрешают всем пользователям создавать, обновлять и удалять товары. Это подходит только для демонстрации!

Для продакшна необходимо:

### 1. Включить авторизацию Supabase

```sql
-- Удалить открытые политики
DROP POLICY "Allow insert for authenticated users" ON products;
DROP POLICY "Allow update for authenticated users" ON products;
DROP POLICY "Allow delete for authenticated users" ON products;

-- Создать политики только для аутентифицированных пользователей
CREATE POLICY "Allow insert for authenticated users" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" ON products
  FOR DELETE
  TO authenticated
  USING (true);
```

### 2. Добавить таблицу ролей (опционально)

Для более детального контроля доступа:

```sql
-- Создание таблицы admin_users
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Обновить политики для проверки роли
DROP POLICY "Allow insert for authenticated users" ON products;
DROP POLICY "Allow update for authenticated users" ON products;
DROP POLICY "Allow delete for authenticated users" ON products;

CREATE POLICY "Allow insert for admins" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

-- Аналогично для UPDATE и DELETE
```

## 📊 Оптимизация производительности

Если у вас большой каталог товаров:

```sql
-- Добавить полнотекстовый поиск
ALTER TABLE products ADD COLUMN search_vector tsvector;

CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Триггер для автоматического обновления search_vector
CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('russian', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_trigger();
```

## 🔧 Устранение неполадок

### Ошибка: "relation 'products' does not exist"
- Убедитесь, что SQL скрипт создания таблицы выполнен успешно
- Проверьте, что вы находитесь в правильном проекте

### Ошибка: "Invalid API key"
- Проверьте, что вы копируете **anon public** ключ, а не service_role
- Убедитесь, что `.env` файл находится в корне проекта
- Перезапустите dev сервер после изменения `.env`

### Товары не отображаются
- Проверьте подключение к интернету
- Откройте DevTools (F12) и проверьте Console на ошибки
- Убедитесь, что в таблице есть данные (через Table Editor в Supabase)

## 📚 Дополнительные ресурсы

- [Supabase Документация](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

После завершения настройки вернитесь к основному [README.md](./README.md) для запуска приложения.
