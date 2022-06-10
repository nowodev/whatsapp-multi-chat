# WhatsApp Multi Client Dashboard

Access and Chat from Multiple WhatsApp numbers on one dashboard

## Run Locally

Clone the project

```bash
  git clone https://github.com/nowodev/whatsapp-multi-chat
```

Go to the project directory

```bash
  cd whatsapp-multi-chat
```

Install Composer dependencies

```bash
  composer install
```

Add Environment Variables

```bash
  cp .env.example .env && php artisan key:generate
```

Migrate, Seed and Start Server

```bash
  php artisan migrate:fresh --seed && php artisan serve
```

Install NPM dependencies

```bash
  npm install & npm run dev
```

or if you want to watch your changes as you develop

```bash
  npm run hot

```

Start the Socket.IO/Express server

```bash
  node server
```

## Tech Stack

**Client:** VueJs, TailwindCSS, Socket.IO

**Server:** Node, Express, Socket.IO

**Framework:** Laravel
