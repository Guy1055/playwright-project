#!/usr/bin/env bash
# Starts a private copy of Toolshop for CI.
# The public site puts a Cloudflare check in front of data-center IPs, so CI tests its own instance.
# That also gives the database tier a real database.
set -euo pipefail

# Pinned so a change upstream cannot break CI unannounced.
TOOLSHOP_REF=ae7caecb811dd8952c09d997e69be7cb946ecd44
export SPRINT=sprint5

mkdir toolshop && cd toolshop
git init -q
git remote add origin https://github.com/testsmith-io/practice-software-testing.git
git fetch -q --depth 1 origin "$TOOLSHOP_REF"
git checkout -q FETCH_HEAD

docker compose -f docker-compose.yml up -d --force-recreate

wait_for() { # description, attempts, delay, command...
  local description=$1 attempts=$2 delay=$3
  shift 3
  for ((i = 1; i <= attempts; i++)); do
    if "$@" >/dev/null 2>&1; then
      echo "$description is ready"
      return 0
    fi
    sleep "$delay"
  done
  echo "$description did not become ready"
  docker compose logs --tail=80
  return 1
}

wait_for "API container" 30 2 docker compose exec -T laravel-api true
docker compose exec -T -u root laravel-api composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-ffi -q
docker compose exec -T -u root laravel-api chown -R www-data:www-data storage bootstrap/cache || true
wait_for "Database" 60 2 docker compose exec -T mariadb mysqladmin ping -h localhost -u root -proot --silent
docker compose exec -T laravel-api php artisan migrate:refresh --seed --quiet
wait_for "API" 30 2 curl -sf http://localhost:8091/status
wait_for "UI" 120 5 curl -sf http://localhost:4200
