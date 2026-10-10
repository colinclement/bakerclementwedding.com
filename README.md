# Liz & Colin — wedding website

A static site for GitHub Pages. Everything the page needs is in this folder.

## Publish on GitHub Pages
1. Create a new public repository on GitHub and upload every file in this folder (keep the `photos` folder).
2. In the repository: Settings → Pages → Source: "Deploy from a branch", Branch: main, folder: / (root). Save.
3. After a minute or two the site is live at https://YOUR-USERNAME.github.io/REPO-NAME/

## Your photos
Replace `photos/photo-1.jpg` … `photo-5.jpg` with your own (same file names), or edit the `<figure>` blocks in the
Photos section of `index.html` to change file names, descriptions (alt text) and captions. Add or remove figures freely.
Landscape photos around 1600px wide work best; the carousel crops to a 4:3 frame.

## RSVP options
In `index.html`, near the bottom: `MEALS` lists the dinner choices and `MAX_GUESTS` sets the largest party one reply can list (currently 6).

## Connect the RSVP form to a Google Sheet
1. Create a Google Sheet (for example "Wedding RSVPs"). Leave it empty; the script makes its own "RSVPs" tab and headers.
2. In the sheet: Extensions → Apps Script. Delete what's there, paste the contents of `rsvp-apps-script.gs`, and save.
3. Deploy → New deployment → gear icon → Web app. Execute as: Me. Who has access: Anyone.
   Click Deploy and approve the permissions. Google may warn that the app isn't verified; it's your own script,
   so choose Advanced → Go to (project name).
4. Copy the Web app URL (it ends in `/exec`, not `/dev`).
5. In `index.html`, find `var RSVP_ENDPOINT = '';` and paste the URL between the quotes. Commit the change.
6. Submit a test RSVP on the live site. Each guest appears as a row in the "RSVPs" tab; guests from one reply share a Party ID.

If you later edit the script: Deploy → Manage deployments → pencil icon → Version: New version → Deploy. The URL stays the same.

Images: border from a 15th-century French book of hours; flowers from a late-15th-century Flemish book of hours. Both public domain.
