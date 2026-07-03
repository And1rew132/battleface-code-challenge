FROM php:8.4-cli-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git libpq-dev unzip \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts --optimize-autoloader

COPY backend ./
COPY deploy/docker/backend/entrypoint.sh /usr/local/bin/battleface-entrypoint

RUN chmod +x /usr/local/bin/battleface-entrypoint \
    && composer dump-autoload --optimize

EXPOSE 8000

ENTRYPOINT ["battleface-entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
