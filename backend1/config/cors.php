<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://172.16.7.131:3000',
    ],

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1|172\.16\.\d+\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):3000$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
