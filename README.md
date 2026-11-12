# Hi! This site is about me

Welcome to the repository of my first web project, which I keep building on.



## 💻 What is this site about?

This project is my business card in the world of the web — a place where I
introduce myself, share my social links, and experiment with websites.


## ✨ Key Features

- **Seamless SPA-like Routing:** Navigating between pages feels instant. The site uses Vanilla JS (`fetch` + `History API`) to swap the `<main>` content without a full page reload.
- **Custom YouTube Integration:** The video players are powered by the official YouTube IFrame API.
- **Scroll-Driven Animations:** Cards expand and videos slide in smoothly as you scroll, using `IntersectionObserver` and `CSS Grid` transitions.


## 🛠 Tech Stack

- **HTML5** — Semantic markup.
- **CSS3** — Built with **BEM methodology**, heavily relies on Flexbox, CSS Grid, custom properties (variables), and keyframe animations.
- **Vanilla JavaScript (ES6+)** — No frameworks, no libraries. Just clean, native browser APIs (Fetch, History API, YouTube IFrame API).
  

## 📁 Project Structure

```text
├── index.html          # Home page
├── about.html          # About me
├── projects.html       # My projects
├── skills.html         # My skills
├── style.css           # All global styles (BEM)
├── router.js           # SPA routing, animations, and logic
└── images/             # Assets and background
```



*The project went live on August 30.*