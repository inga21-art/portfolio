# Inga Plati portfolio

Static site (HTML, CSS, JS). No build step.

## Deploy on Vercel
1. Put this folder in a GitHub repo (index.html must be at the repo root).
2. On vercel.com choose Add New > Project, import the repo.
3. Framework Preset: Other. Leave build command and output directory empty. Deploy.
(Or run `npx vercel` inside the folder, if you have Node installed.)

## Add the missing logos
TFG and Western Cape logos are included. Still missing: assets/logos/dmt.png (Desmond Mpilo Tutu High School). Save a PNG with that exact name; until then a text chip shows.

## CV
assets/Inga_Plati_CV.pdf is your August CV with the references hidden. Replace it with an updated CV (same file name) when you have one.

## Edit content
- Phone number: search index.html for 27637269936 and 063 726 9936 .
- Reflections: index.html, section id="reflections". They are drafts; rewrite in your own words.

## Dark theme colours
The dark navy bands (hero, projects, reflections, footer) are set by --navy, --navy-2 and --navy-3 at the bottom of styles.css.
