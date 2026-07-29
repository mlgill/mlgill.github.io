require "date"
require "open3"

module Jekyll
  class LastCommitDateGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      timestamp, status = Open3.capture2("git", "show", "-s", "--format=%cI", "HEAD")

      unless status.success? && !timestamp.strip.empty?
        raise Errors::FatalException, "Unable to determine the latest Git commit date."
      end

      site.config["last_commit_date"] = DateTime.iso8601(timestamp.strip)
    rescue ArgumentError => e
      raise Errors::FatalException, "Unable to parse the latest Git commit date: #{e.message}"
    end
  end
end
