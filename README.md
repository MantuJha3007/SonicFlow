# 🎵 SonicFlow 🎵

Welcome to **SonicFlow**! This is a magical full-stack web application. It has a beautiful, speedy front screen for users to click on, and a powerful, secret engine in the back that remembers information, handles secure logins, and saves pictures!

## ✨ What Can This Toy Do? (Features)

* **Beautiful Looks:** A super fast and pretty user interface built with modern tools.
* **Secret Club Access:** Secure logins using encrypted passwords and VIP badges (JWT).
* **Photo Album:** You can upload pictures, and they are magically saved and managed using ImageKit.
* **Perfect Memory:** Everything is neatly filed away in a MongoDB database so nothing gets lost.

## 🧱 The Building Blocks (Tech Stack)

Just like a Lego castle needs different types of blocks, SonicFlow uses the best tools for both the front and the back!

### 🎨 The Front Screen (Frontend)
* **Next.js (v16) & React (v19):** The paint and canvas that make everything show up on the screen incredibly fast.
* **Tailwind CSS (v4):** Our magic wand for styling. It makes adding colors and shapes super easy!
* **Lucide React:** A giant box of beautiful, shiny icons.

### 🚂 The Magic Engine (Backend)
* **Node.js & Express:** The speedy mail carrier that listens for clicks on the front screen and brings back answers.
* **Mongoose (MongoDB):** The giant, endless filing cabinet for our data.
* **Bcryptjs & JWT:** The clubhouse bouncers that keep our passwords safe.
* **Multer & ImageKit:** Our photo handlers that process and store images safely.
* **Local Power:** We like to keep our backend infrastructure safe and sound right here on our own computer. We don't send it up to cloud platforms—it stays local where we can watch it!

---

## 🚀 How to Play With This on Your Computer (Local Setup)

Want to bring SonicFlow to your own house? Just open your computer's command line (the secret black screen) and follow these simple steps!

### Step 1: Copy the Toybox
First, fetch the whole project from the internet shelf to your computer.
```bash
git clone [https://github.com/mantujha3007-web/SonicFlow.git](https://github.com/mantujha3007-web/SonicFlow.git)
cd SonicFlow

(Note: This project is split into two rooms—one for the Frontend and one for the Backend! Let's set them both up.)


# Step 2: Start the Magic Engine (Backend)
Open a terminal window and walk into the backend room to turn on the engine.

# Walk into the backend folder (assuming it is named project_3 or backend)
cd project_3

# Collect all the missing gears and batteries
npm install

# Create your secret map! 
# Make a file called .env in this folder and add your MongoDB and ImageKit secrets.
touch .env

# Push the giant green ON button!
npm run dev

# Step 3: Turn on the Front Screen (Frontend)
Open a new terminal window (leave the backend running!) and walk into the frontend room.

# Walk into the frontend folder
cd frontend

# Collect all the paint and brushes
npm install

# Turn on the screen!
npm run dev

