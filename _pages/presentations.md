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

{% for pres in year_group.entries %}
{% if pres.visible != false %}
**{{ pres.title }}**
{% if pres.authors and pres.authors != "" %}<br>{{ pres.authors }}{% endif %}
<br>*{{ pres.venue }}*
<br>{{ pres.type }}{% if pres.date %}, {{ pres.date }}{% endif %}{% if pres.location %}, {{ pres.location }}{% endif %}
{% if pres.links.slides or pres.links.video or pres.links.abstract or pres.links.program or pres.links.code or pres.links.thesis %}<br>{% if pres.links.slides %}<a href="{{ pres.links.slides }}" class="btn-presentation btn-slides">SLIDES</a> {% endif %}{% if pres.links.video %}<a href="{{ pres.links.video }}" class="btn-presentation btn-video">VIDEO</a> {% endif %}{% if pres.links.abstract %}<a href="{{ pres.links.abstract }}" class="btn-presentation btn-abstract">ABSTRACT</a> {% endif %}{% if pres.links.program %}<a href="{{ pres.links.program }}" class="btn-presentation btn-program">PROGRAM</a> {% endif %}{% if pres.links.code %}<a href="{{ pres.links.code }}" class="btn-presentation btn-code">CODE</a> {% endif %}{% if pres.links.thesis %}<a href="{{ pres.links.thesis }}" class="btn-presentation btn-thesis">THESIS</a>{% endif %}{% endif %}

{% endif %}
{% endfor %}
{% endfor %}
