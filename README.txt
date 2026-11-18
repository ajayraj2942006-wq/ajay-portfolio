AJAY R — PORTFOLIO STARTER

FILES
- index.html: complete responsive website with styling and interactions
- design-preview.svg: static visual preview of the overall style
- assets/ajay-portrait.png: portrait displayed on the homepage
- assets/mechanical-gears.jpg: real gear photograph used as the scroll-rotating background

IMAGE SOURCE
- Photograph: “Gears (22711070429).jpg” by Joe deSousa, via Wikimedia Commons
- License: CC0 1.0 public domain dedication
- Source: https://commons.wikimedia.org/wiki/File:Gears_(22711070429).jpg

HOW TO VIEW
1. Extract the ZIP file.
2. To use the contact form, install Node.js and configure the email backend below.
3. Run npm start and open http://localhost:3000 in Chrome, Edge, Firefox, or another modern browser.
4. You can edit the files in VS Code or another text editor.

CONTACT FORM EMAIL
Messages are sent to ajayraj2942006@gmail.com through Gmail SMTP.
1. In this folder, run: npm install
2. Copy .env.example to .env.
3. Set SMTP_USER to your Gmail address and SMTP_PASS to a Google App Password. App Passwords require 2-Step Verification. Do not use your regular Gmail password.
4. Run: npm start
5. Open http://localhost:3000 and submit a test message.

Keep .env private and never publish it. The API validates submissions, limits repeated requests, and keeps SMTP credentials on the server. Opening index.html directly or using static-only hosting will not send email; deploy this Node.js app on a server host and set its SMTP values in private environment settings. If the host uses a trusted reverse proxy, set TRUST_PROXY_HOPS to its documented proxy-hop count.

PUBLISH WITH RENDER
1. Create a GitHub repository and upload/push all project files, including render.yaml. Do not upload .env or node_modules.
2. Sign in to Render, choose New > Blueprint, and connect your GitHub repository.
3. During setup, enter SMTP_USER (your Gmail address) and SMTP_PASS (your Google App Password) as private environment values. Never put the App Password in GitHub or share it in chat.
4. Deploy the Blueprint. When the deployment finishes, Render will show the public URL (for example, https://ajay-r-portfolio.onrender.com). Open it and submit a test message.
5. If the generated URL is taken, change the service name in render.yaml or choose another available name in Render.

The Render free service may sleep when idle and take a short time to wake up. A public URL is not created until you complete deployment in your Render account.

BEFORE PUBLISHING
1. Confirm CONTACT_TO in your .env file and deployment environment.
2. Add your LinkedIn and GitHub profile URLs in LINKEDIN_URL and GITHUB_URL.
3. Confirm the official college name and your degree details.
4. Remove skills you have not learned yet (items marked with *).
5. Replace the sample project cards with real projects, images, links and results.
6. Add certificates only if you have them.
7. Do not publish your registration number, home address, or other private information.

PUBLISHING
Deploy the Node.js app to a host that supports running a server, and configure its SMTP settings privately. Static-only hosting (including GitHub Pages) cannot run the email backend. The site is a starter template; it has not been published online automatically.
