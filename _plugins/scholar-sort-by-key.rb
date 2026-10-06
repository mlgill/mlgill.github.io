# jekyll-scholar's `sort_by` resolves names as BibTeX fields, so `key` (the
# citation key, which is not a field) compares every entry as equal. Expose it
# so `_config.yml` can sort by year, then key.
module Jekyll
  class Scholar
    module Utilities
      alias_method :resolve_sort_value_without_citation_key, :resolve_sort_value

      def resolve_sort_value(entry, key)
        return BibTeX::Value.new(entry.key.to_s) if key == 'key'

        resolve_sort_value_without_citation_key(entry, key)
      end
    end
  end
end
