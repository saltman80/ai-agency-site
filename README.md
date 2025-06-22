# AI Agency Site

This project contains a static, single-page website for an AI agency. All HTML, CSS and JavaScript files are included and no build step is required.

## Running locally

Any standard HTTP server can host the site. For quick testing you can use Python or Node:

```bash
# using Python
python3 -m http.server 8080
# or using Node's http-server
npx http-server -p 8080
```
Then open `http://localhost:8080/` in your browser.

## Hosting on any server

Copy the repository files to your server's document root. The site works on Apache, nginx, or any static hosting provider because it does not rely on Node at runtime.

The included contact form is purely static. Integrate it with your own backend or use a third-party form service for submissions.


