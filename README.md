# Tiket Frontend

Frontend React + Vite untuk platform pemesanan tiket event.

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- Framer Motion
- Axios
- React Router

## Fitur

- Home dengan search, filter kategori, sorting, dan upcoming toggle
- Detail event dengan metadata lengkap
- Login dan register
- Checkout tiket
- Pilih payment method aktif
- Voucher preview saat checkout
- Membership page
- History tiket
- Receipt dan print ticket
- Admin dashboard
- Scanner admin
- Chatbot UI

## Setup

```bash
cd tiket-frontend
npm install
npm run dev
```

Default frontend jalan di:

```txt
http://localhost:5173
```

## Arsitektur API

Frontend memakai path relatif:

```txt
/api
```

Saat development, Vite proxy akan meneruskan request ke backend Laravel di:

```txt
http://localhost:8000
```

Jadi frontend tidak perlu menyimpan secret key payment atau chatbot.

## Script

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Struktur Halaman

- `/` home
- `/login`
- `/register`
- `/ticket/:id`
- `/checkout/:id`
- `/history`
- `/membership`
- `/receipt/:id`
- `/print/:id`
- `/admin`
- `/admin/scanner`

## Catatan Development

- Pastikan backend Laravel sudah jalan sebelum frontend dipakai.
- File gambar event diambil dari endpoint `/storage/...`.
- Midtrans Snap script dan daftar payment method diambil dari backend lewat `/api/public-config`.

## Build

```bash
npm run build
```

Output production ada di folder:

```txt
dist/
```

## Catatan Deploy

- Untuk production paling aman, deploy frontend dan backend di domain/origin yang sama.
- Reverse proxy seperti Nginx cocok untuk route `/api` dan `/storage`.
