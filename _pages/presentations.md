---
layout: page
permalink: /presentations/
title: presentations
description: Keynotes and invited talks
nav: true
nav_order: 5
---

{% for year_group in site.data.presentations %}
## {{ year_group.year }}
{% for pres in year_group.entries %}{% if pres.visible != false %}
**{{ pres.title }}**{% if pres.authors and pres.authors != "" %}<br>{{ pres.authors }}{% endif %}<br>*{{ pres.venue }}*<br>{{ pres.type }}{% if pres.date %}, {{ pres.date }}{% endif %}{% if pres.location %}, {{ pres.location }}{% endif %}{% include presentation-links.liquid links=pres.links variant="page" %}

{% endif %}{% endfor %}
{% endfor %}
