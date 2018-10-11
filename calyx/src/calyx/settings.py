"""
Django settings for calyx.

Calyx is a backend implementation of Saffron ( https://github.com/StudioAquatan/Saffron.git ).
"""

import os
import dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

env_file = os.path.join(BASE_DIR, '.env')

if os.path.exists(env_file):
    dotenv.load_dotenv(env_file)

DEBUG = os.getenv('CALYX_DEBUG', 'False').lower() == 'true'

SECRET_KEY = os.getenv('CALYX_SECRET_KEY')

ALLOWED_HOSTS = []

for host in os.getenv('CALYX_ALLOWED_HOSTS', '*').split(','):
    ALLOWED_HOSTS.append(host.strip())

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_jwt',
    'rest_framework_swagger',
    'djoser',
    'years',
    'courses',
    'users',
    'labs'
]

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'calyx.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'calyx.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('BULB_DB_NAME'),
        'USER': os.getenv('BULB_DB_USER'),
        'HOST': os.getenv('BULB_DB_HOST'),
        'PASSWORD': os.getenv('BULB_DB_PASSWORD'),
        'PORT': int(os.getenv('BULB_DB_PORT', '3306')),
    }
}

EMAIL_HOST = os.getenv('CALYX_EMAIL_HOST')
EMAIL_PORT = int(os.getenv('CALYX_EMAIL_PORT'))
EMAIL_HOST_USER = os.getenv('CALYX_EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('CALYX_EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = os.getenv('CALYX_EMAIL_USE_TLS', 'False').lower() == 'true'
DEFAULT_FROM_EMAIL = os.getenv('CALYX_EMAIL_DEFAULT_FROM')

if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # デバッグ時はコンソールに出力
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

DJOSER = {
    'PASSWORD_RESET_CONFIRM_URL': '#/password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': '#/activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'SERIALIZERS': {},
    'EMAIL': {
        'activation': 'users.email.SaffronActivationEmail'
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
}

LANGUAGE_CODE = 'ja-jp'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = 'static/'

STUDENT_EMAIL_DOMAIN = os.getenv('CALYX_STUDENT_EMAIL_DOMAIN', 'edu.kit.ac.jp')

# Site and email template variables
SITE_NAME = os.getenv('SITE_NAME', 'Saffron')
MANAGEMENT_TEAM_NAME = os.getenv('CALYX_MANAGEMENT_TEAM_NAME')
MANAGEMENT_TEAM_EMAIL = os.getenv('CALYX_MANAGEMENT_TEAM_EMAIL', DEFAULT_FROM_EMAIL)

# domain and protocol of petals
PETALS_DOMAIN = os.getenv('PETALS_DOMAIN')
PETALS_PROTOCOL = os.getenv('PETALS_PROTOCOL', 'https')
