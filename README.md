<div align="center">

# 🌑 ShadowRealm

**A full-stack social platform where voices go anonymous.**

![JavaScript](https://img.shields.io/badge/JavaScript-57%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-27%25-3776AB?style=flat-square&logo=python&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-10%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-5.5%25-E34F26?style=flat-square&logo=html5&logoColor=white)

> CSE 2100 — Software Development Project · Built with React + Python backend + WebSocket

</div>

---

## 📖 Overview

**ShadowRealm** is a full-stack web application that allows users to publish posts, share thoughts, and chat in real-time — with the option to post completely anonymously. The platform is designed around the idea that people express themselves more freely when identity is optional.

Key highlights:
- Smooth sign-in / sign-up flow with a separate admin portal entrance
- Dedicated post creation page that handles its own state — no interference with the feed
- Real-time WebSocket-powered chat system
- Anonymous posting support
- File attachment support on posts
- Account center with profile editing and activity stats
- Clean, dark-themed UI throughout

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth System** | Sign in or create an account; separate admin portal for moderation |
| 📝 **Create Posts** | Compose posts with a title, content body, and file attachments |
| 👻 **Anonymous Posting** | Toggle to publish without revealing your identity |
| 💬 **Real-time Chat** | Live WebSocket direct messages — conversations appear instantly |
| 📁 **File Attachments** | Attach files directly to any post |
| 👤 **Account Center** | View post/community/upload stats, edit username and email |
| 🔄 **Feed Isolation** | Post creation runs independently — navigates back to feed on success |
| 🌑 **Dark UI** | Sleek dark-mode-first design throughout |

---

## 🗂️ Project Structure

```
CSE-2100-PROJECT-Repo/
├── frontend/          # React.js SPA — UI, routing, WebSocket client
│   └── src/
│       ├── app/
│       │   └── create-post/   # Dedicated post creation page
│       └── ...
├── backend/           # Python backend — REST API + WebSocket server
│   └── ...
└── .gitignore
```

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — component-based SPA with client-side routing
- **Vite** — lightning-fast dev server (runs on `localhost:5173`)
- **CSS** — custom dark-theme styling

### Backend
- **Python** — REST API server
- **WebSockets** — real-time bidirectional communication for the chat system

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- `pip` and `npm`

---

### 1. Clone the repository

```bash
git clone https://github.com/ranger-os0133/CSE-2100-PROJECT-Repo.git
cd CSE-2100-PROJECT-Repo
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py        # or however your entry point is named
```

The backend server should start and begin listening for API and WebSocket connections.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser and go to → **http://localhost:5173**

---

## 📸 Screenshots

### 🔐 Login Page
> Sign in or create an account. Admins can access the moderation portal via a separate entrance.

![ShadowRealm Login Page](screenshots/login.png)

---

### 📝 Compose Post
> Write a title, add content, attach files, and optionally post anonymously — all from an isolated page.

![Compose Post Page](screenshots/compose-post.png)

---

### 💬 Direct Messages
> Real-time private conversations powered by WebSockets.

![Direct Messages Page](screenshots/dm.png)

---

### 👤 Account Center
> View your post, community, and upload stats. Edit your username and email from one clean surface.

![Account Center Page](screenshots/account-center.png)

---

## 🔌 WebSocket Chat

ShadowRealm features a dedicated real-time messaging system powered by WebSockets. Messages are delivered and received instantly without page refreshes, making conversations feel native and fluid.

The chat system connects to the Python backend which manages connection state, message broadcasting, and room handling.

---

## 📝 Post Creation Flow

The `create-post` page is intentionally **isolated from feed state**:

1. User fills in the **title** and **content**
2. Optionally attaches files
3. Optionally toggles **Post anonymously**
4. On successful publish → automatically redirected back to the feed

This design ensures the feed does not re-render or lose its scroll position during post creation.

---

## 🔐 Auth & Admin

ShadowRealm has two separate authentication pathways:

- **Regular users** — sign up or sign in through the main login page
- **Admins** — access the platform via the dedicated **admin portal** (`Enter admin section →`) for moderation and platform control

---

## 🤝 Contributing

This is a university project under **CSE 2100**, but contributions and suggestions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👥 Team

| Student ID | GitHub |
|---|---|
| 2303133 | [@ranger-os0133](https://github.com/ranger-os0133) |
| 2303134 | [@Arpon2005](https://github.com/Arpon2005) |
| 2303147 | [@uranium147](https://github.com/uranium147) |
| 2303173 | [@dattaemon247-art](https://github.com/dattaemon247-art) |

---

## 📄 License

This project was developed as part of the **CSE 2100 Software Development Project** coursework. All rights reserved by the respective authors.

---

<div align="center">
  <sub>Built with 🖤 for CSE 2100 · ShadowRealm — where your voice echoes without a face.</sub>
</div>
