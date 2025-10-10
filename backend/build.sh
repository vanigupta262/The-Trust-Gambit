#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip

pip install -r backend/requirements.txt

cd backend

python manage.py collectstatic

python manage.py migrate
