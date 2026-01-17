# Custom BibTeX filters for handling LaTeX math mode and text commands
# These filters convert LaTeX notation to HTML for display in Jekyll

require 'bibtex'
require 'singleton'

module BibTeX
  # Filter to convert \textsubscript{} to HTML <sub> tags
  class Subscript < Filter
    include Singleton

    def apply(value)
      value.to_s.gsub(/\\textsubscript\s*\{([^}]*)\}/, '<sub>\1</sub>')
    end
  end

  # Filter to convert LaTeX math mode superscripts/subscripts to HTML
  # Handles patterns like $^{13}$C, $_{3}$, etc.
  class Mathmode < Filter
    include Singleton

    def apply(value)
      result = value.to_s

      # Handle math mode superscripts: $^{text}$
      result = result.gsub(/\$\^\{([^}]*)\}\$/, '<sup>\1</sup>')
      # Handle single char superscripts: $^x$
      result = result.gsub(/\$\^([^$\s{}])\$/, '<sup>\1</sup>')

      # Handle math mode subscripts: $_{text}$
      result = result.gsub(/\$_\{([^}]*)\}\$/, '<sub>\1</sub>')
      # Handle single char subscripts: $_x$
      result = result.gsub(/\$_([^$\s{}])\$/, '<sub>\1</sub>')

      # Handle \textit{} for italics
      result = result.gsub(/\\textit\s*\{([^}]*)\}/, '<i>\1</i>')

      result
    end
  end
end

