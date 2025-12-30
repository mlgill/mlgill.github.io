# Website TODO

## Pending Issues

- [ ] **Fix author list truncation**: The `max_author_limit` config setting doesn't seem to work as expected. Need to investigate why setting it to blank/0/100 doesn't disable truncation. May require Jekyll server restart or deeper investigation of the bib.liquid template caching.

- [ ] **Search showing old content**: The search link in the navbar is surfacing old/stale content. Likely cause: example/template content from al-folio is being indexed (e.g., `_projects/`, `_posts/`, `_news/`, `_pages/about_einstein.md`, etc.). To fix, either delete the example content or exclude it from indexing.

- [ ] **Social icons too big**: Icons at the bottom of the "about" section are too large.

- [ ] **Left-align publications**: Publications are indented; try to left-align them with their heading.

- [ ] **Add year groupings to presentations and patents**: Should have year headings and a rule between years, similar to publications.

- [ ] **Check patent grant status**: Search patents to determine which ones have been granted and update accordingly.

- [ ] **Selected Publications formatting in CV**: Selected Publications aren't correctly formatted in the CV section.

- [ ] **CV to PDF conversion**: Investigate how to convert CV to PDF when building (find markdown CV example on web). Create PDF and add a PDF link to the top right of the CV page, like in the template.

- [ ] **Consider adding Selected Presentations to CV**: Decide if Selected Presentations should be added to the CV.

## Deployment Steps

Steps to run before deploying the blog:

1. Initialize rbenv (if not already in shell):
   ```bash
   eval "$(rbenv init -)" && rbenv local 3.3.10
   ```

2. Clean Jekyll cache:
   ```bash
   rm -rf _site .jekyll-cache .jekyll-metadata
   # or: bundle exec jekyll clean
   ```

3. Rebuild the site:
   ```bash
   bundle exec jekyll build
   ```

For local development:
```bash
eval "$(rbenv init -)" && rbenv local 3.3.10 && bundle exec jekyll serve
```

## Completed

- [x] Remove "Photos from Unsplash" from footer (required cache clean + server restart)
- [x] Convert site from old blog to al-folio template
- [x] Add poster links to publications with conference info
- [x] Add thesis presentation to presentations page
- [x] Update press section with Learning from Machine Learning podcast
- [x] Style publication/presentation buttons with colors
- [x] Create custom CV templates (experience, education, publications, awards)
- [x] Hide year for "In preparation" publications
