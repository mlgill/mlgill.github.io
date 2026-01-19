# mlgill.github.io

Personal academic website for Michelle Lynn Gill, Ph.D.

## Local Development

### Prerequisites

- Ruby (managed via rbenv)
- Bundler

### Setup

```bash
# Initialize rbenv
eval "$(rbenv init -)"

# Install dependencies
bundle install
```

### Running Locally

```bash
# Start the development server
bundle exec jekyll serve
```

The site will be available at http://127.0.0.1:4000

### Building

```bash
# Clean previous build
bundle exec jekyll clean

# Build the site
bundle exec jekyll build
```

The built site will be in the `_site/` directory.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `master` branch.

---

This site is based on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme, available under the [MIT License](https://github.com/alshedivat/al-folio/blob/main/LICENSE).
