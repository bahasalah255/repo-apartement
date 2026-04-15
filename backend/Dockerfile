FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

FROM node:20-bookworm-slim AS assets
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM php:8.3-cli-bookworm
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    && docker-php-ext-install pdo_pgsql mbstring zip intl opcache bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=vendor /app/vendor ./vendor

COPY . .
COPY --from=assets /app/public/build ./public/build

RUN php artisan storage:link || true

EXPOSE 10000

CMD sh -c "php artisan migrate --force && php artisan serve --host 0.0.0.0 --port ${PORT:-10000}"