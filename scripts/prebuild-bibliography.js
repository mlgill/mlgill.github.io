#!/usr/bin/env node
/**
 * Pre-process papers.bib into a cached YAML file for faster Jekyll builds
 *
 * This script:
 * 1. Parses the BibTeX file
 * 2. Applies LaTeX filters (mathmode, subscript, superscript, smallcaps)
 * 3. Parses author names into arrays
 * 4. Outputs structured YAML that Jekyll can read directly
 *
 * Usage:
 *   node prebuild-bibliography.js [--force]
 *   --force: Regenerate even if papers.bib hasn't changed
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.join(SCRIPT_DIR, '..');
const BIB_FILE = path.join(ROOT_DIR, '_bibliography', 'papers.bib');
const CACHE_FILE = path.join(ROOT_DIR, '_data', 'bibliography_cache.yml');
const HASH_FILE = path.join(ROOT_DIR, '_data', '.bibliography_hash');

/**
 * Simple BibTeX parser
 * Handles the format used in this project
 */
function parseBibTeX(content) {
  const entries = [];

  // Remove YAML front matter if present
  content = content.replace(/^---[\s\S]*?---\s*/, '');

  // Match BibTeX entries: @type{key, ... }
  const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,\s*([\s\S]*?)\n\}/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const fieldsStr = match[3];

    const entry = {
      type,
      key,
    };

    // Parse fields
    const fieldRegex = /(\w+)\s*=\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase();
      let fieldValue = fieldMatch[2].trim();
      entry[fieldName] = fieldValue;
    }

    entries.push(entry);
  }

  return entries;
}

/**
 * Apply LaTeX filters similar to Jekyll-scholar's bibtex_filters
 */
function applyLatexFilters(text) {
  if (!text) return text;

  // Math mode: $...$ -> <span class="math">...</span>
  // For simple cases, just remove the $ delimiters
  text = text.replace(/\$([^$]+)\$/g, '$1');

  // Subscript: _{...} or _x -> <sub>...</sub>
  text = text.replace(/\_\{([^}]+)\}/g, '<sub>$1</sub>');
  text = text.replace(/\_([a-zA-Z0-9])/g, '<sub>$1</sub>');

  // Superscript: ^{...} or ^x -> <sup>...</sup>
  text = text.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
  text = text.replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');

  // Small caps: \textsc{...} -> <span style="font-variant: small-caps">...</span>
  text = text.replace(/\\textsc\{([^}]+)\}/g, '<span style="font-variant: small-caps">$1</span>');

  // Bold: \textbf{...} -> <strong>...</strong>
  text = text.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');

  // Italic: \textit{...} or \emph{...} -> <em>...</em>
  text = text.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
  text = text.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');

  // Remove remaining LaTeX commands
  text = text.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1');
  text = text.replace(/\{([^}]*)\}/g, '$1');

  // Clean up special characters
  text = text.replace(/\\&/g, '&');
  text = text.replace(/\\\$/g, '$');
  text = text.replace(/\\%/g, '%');
  text = text.replace(/\\#/g, '#');
  text = text.replace(/---/g, '\u2014'); // em dash
  text = text.replace(/--/g, '\u2013');  // en dash
  text = text.replace(/``/g, '\u201C');  // left double quote
  text = text.replace(/''/g, '\u201D');  // right double quote
  text = text.replace(/`/g, '\u2018');   // left single quote
  text = text.replace(/'/g, '\u2019');   // right single quote

  return text;
}

/**
 * Parse author string into array of {first, last} objects
 * Handles "Last, First and Last2, First2" and "First Last and First2 Last2" formats
 */
function parseAuthors(authorStr) {
  if (!authorStr) return [];

  // Split by " and "
  const authors = authorStr.split(/\s+and\s+/i);

  return authors.map(author => {
    author = author.trim();

    // Check if format is "Last, First" or "First Last"
    if (author.includes(',')) {
      // "Last, First" format
      const parts = author.split(',').map(p => p.trim());
      return {
        last: applyLatexFilters(parts[0]),
        first: applyLatexFilters(parts.slice(1).join(' '))
      };
    } else {
      // "First Last" format - last word is last name
      const parts = author.split(/\s+/);
      const last = parts.pop();
      const first = parts.join(' ');
      return {
        last: applyLatexFilters(last),
        first: applyLatexFilters(first)
      };
    }
  });
}

/**
 * Convert entry to YAML-safe format
 */
function processEntry(entry) {
  const processed = {
    key: entry.key,
    type: entry.type,
  };

  // Process author into array
  if (entry.author) {
    processed.author_array = parseAuthors(entry.author);
  }

  // Apply filters to text fields
  const textFields = ['title', 'journal', 'booktitle', 'publisher', 'abstract'];
  for (const field of textFields) {
    if (entry[field]) {
      processed[field] = applyLatexFilters(entry[field]);
    }
  }

  // Copy other fields as-is
  const copyFields = ['year', 'volume', 'number', 'pages', 'doi', 'html', 'pdf',
                      'selected', 'recent', 'bibtex_show', 'abbr', 'award',
                      'award_name', 'blog', 'code', 'poster', 'poster1',
                      'poster1_conf', 'poster1_abstract', 'poster2',
                      'poster2_conf', 'poster2_abstract', 'arxiv', 'altmetric',
                      'google_scholar_id', 'inspirehep_id', 'preview'];

  for (const field of copyFields) {
    if (entry[field] !== undefined) {
      // Convert 'true'/'false' strings to booleans
      if (entry[field] === 'true') {
        processed[field] = true;
      } else if (entry[field] === 'false') {
        processed[field] = false;
      } else {
        processed[field] = entry[field];
      }
    }
  }

  return processed;
}

/**
 * Convert to YAML format
 */
function toYAML(entries) {
  const lines = ['# Auto-generated from papers.bib - DO NOT EDIT DIRECTLY',
                 '# Run: node scripts/prebuild-bibliography.js', ''];

  for (const entry of entries) {
    lines.push(`- key: "${entry.key}"`);
    lines.push(`  type: "${entry.type}"`);

    if (entry.author_array && entry.author_array.length > 0) {
      lines.push('  author_array:');
      for (const author of entry.author_array) {
        // Escape quotes in names
        const first = (author.first || '').replace(/"/g, '\\"');
        const last = (author.last || '').replace(/"/g, '\\"');
        lines.push(`    - first: "${first}"`);
        lines.push(`      last: "${last}"`);
      }
    }

    // String fields that might contain special characters
    const stringFields = ['title', 'journal', 'booktitle', 'publisher', 'abstract',
                          'pages', 'doi', 'html', 'pdf', 'abbr', 'award', 'award_name',
                          'blog', 'code', 'poster', 'poster1', 'poster1_conf',
                          'poster1_abstract', 'poster2', 'poster2_conf',
                          'poster2_abstract', 'arxiv', 'preview'];

    for (const field of stringFields) {
      if (entry[field] !== undefined) {
        // Use YAML literal style for strings with special characters
        const value = String(entry[field]).replace(/"/g, '\\"');
        lines.push(`  ${field}: "${value}"`);
      }
    }

    // Numeric fields
    const numericFields = ['year', 'volume', 'number', 'altmetric', 'google_scholar_id',
                           'inspirehep_id'];
    for (const field of numericFields) {
      if (entry[field] !== undefined) {
        lines.push(`  ${field}: ${entry[field]}`);
      }
    }

    // Boolean fields
    const boolFields = ['selected', 'recent', 'bibtex_show'];
    for (const field of boolFields) {
      if (entry[field] !== undefined) {
        lines.push(`  ${field}: ${entry[field]}`);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Compute hash of file content
 */
function computeHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');

  // Read BibTeX file
  if (!fs.existsSync(BIB_FILE)) {
    console.error(`Error: ${BIB_FILE} not found`);
    process.exit(1);
  }

  const bibContent = fs.readFileSync(BIB_FILE, 'utf8');
  const currentHash = computeHash(bibContent);

  // Check if we need to regenerate
  if (!force && fs.existsSync(HASH_FILE) && fs.existsSync(CACHE_FILE)) {
    const storedHash = fs.readFileSync(HASH_FILE, 'utf8').trim();
    if (storedHash === currentHash) {
      console.log('Bibliography unchanged, skipping regeneration');
      return;
    }
  }

  console.log('Parsing bibliography...');

  // Parse BibTeX
  const entries = parseBibTeX(bibContent);
  console.log(`Found ${entries.length} entries`);

  // Process entries
  const processedEntries = entries.map(processEntry);

  // Sort by year (descending), then by key
  processedEntries.sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    if (yearB !== yearA) return yearB - yearA;
    return (a.key || '').localeCompare(b.key || '');
  });

  // Convert to YAML
  const yaml = toYAML(processedEntries);

  // Ensure _data directory exists
  const dataDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write files
  fs.writeFileSync(CACHE_FILE, yaml);
  fs.writeFileSync(HASH_FILE, currentHash);

  console.log(`Wrote ${processedEntries.length} entries to ${CACHE_FILE}`);
}

main();
