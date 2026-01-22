---
layout: cv-print
permalink: /cv/concise/print/
title: Concise CV
nav: false
cv_type: concise
sitemap: false
---
# {{ site.data.bio.name }}
{{ site.data.bio.title }}

{% if site.data.socials.email %}<div id="email"><a href="mailto:{{ site.data.socials.email }}">{{ site.data.socials.email }}</a></div>{% endif %}
<div id="webaddress">
<a href="https://github.com/{{ site.data.socials.github_username }}">GitHub</a> |
<a href="https://linkedin.com/in/{{ site.data.socials.linkedin_username }}">LinkedIn</a> |
<a href="https://michellelynngill.com">Personal Website</a>
</div>

## Overview

{{ site.data.bio.bio }}

## Education
{% for edu in site.data.education %}
{% if edu.visible != false and edu.selected == true %}
`{{ edu.year }}`
__{{ edu.title }}__
<br>{{ edu.institution }}, {{ edu.location }}
{% if edu.description %}
{% for desc in edu.description %}
- {{ desc }}
{% endfor %}
{% endif %}

{% endif %}
{% endfor %}

## Experience
{% for exp in site.data.experience %}
{% if exp.visible != false and exp.selected == true %}
`{{ exp.year }}`
__{{ exp.title }}__, {{ exp.institution }}
{% if exp.description %}
{% for desc in exp.description %}
- {{ desc }}
{% endfor %}
{% endif %}

{% endif %}
{% endfor %}

## Publications

{% include cv_bibliography.liquid selected_only=true %}

### Patents
{% for year_group in site.data.patents %}
{% for patent in year_group.entries %}
{% if patent.visible != false and patent.selected == true %}
`{{ year_group.year }}`
__{{ patent.title }}__
- {{ patent.authors }}
- {{ patent.details }}

{% endif %}
{% endfor %}
{% endfor %}

## Presentations
{% for year_group in site.data.presentations %}
{% for pres in year_group.entries %}
{% if pres.visible != false and pres.selected == true %}
`{{ year_group.year }}`
__{{ pres.title }}__{% if pres.venue %}, *{{ pres.venue }}*{% endif %}
{% if pres.authors and pres.authors != "" %}- {{ pres.authors }}
{% endif %}{% if pres.type and pres.type != "" %}- {{ pres.type }}{% if pres.date %}, {{ pres.date }}{% endif %}{% if pres.location %}, {{ pres.location }}{% endif %}
{% endif %}{% if pres.links.slides or pres.links.video or pres.links.abstract or pres.links.program or pres.links.code or pres.links.thesis %}- {% if pres.links.slides %}{% if pres.links.slides contains "://" %}<a href="{{ pres.links.slides }}" class="pres-slides">Slides</a>{% else %}<a href="{{ pres.links.slides | relative_url }}" class="pres-slides">Slides</a>{% endif %}{% endif %}{% if pres.links.video %}{% if pres.links.slides %} · {% endif %}<a href="{{ pres.links.video }}" class="pres-video">Video</a>{% endif %}{% if pres.links.abstract %}{% if pres.links.slides or pres.links.video %} · {% endif %}{% if pres.links.abstract contains "://" %}<a href="{{ pres.links.abstract }}" class="pres-abstract">Abstract</a>{% else %}<a href="{{ pres.links.abstract | relative_url }}" class="pres-abstract">Abstract</a>{% endif %}{% endif %}{% if pres.links.program %}{% if pres.links.slides or pres.links.video or pres.links.abstract %} · {% endif %}{% if pres.links.program contains "://" %}<a href="{{ pres.links.program }}" class="pres-program">Program</a>{% else %}<a href="{{ pres.links.program | relative_url }}" class="pres-program">Program</a>{% endif %}{% endif %}{% if pres.links.code %}{% if pres.links.slides or pres.links.video or pres.links.abstract or pres.links.program %} · {% endif %}<a href="{{ pres.links.code }}" class="pres-code">Code</a>{% endif %}{% if pres.links.thesis %}{% if pres.links.slides or pres.links.video or pres.links.abstract or pres.links.program or pres.links.code %} · {% endif %}{% if pres.links.thesis contains "://" %}<a href="{{ pres.links.thesis }}" class="pres-thesis">Thesis</a>{% else %}<a href="{{ pres.links.thesis | relative_url }}" class="pres-thesis">Thesis</a>{% endif %}{% endif %}
{% endif %}
{% endif %}
{% endfor %}
{% endfor %}

## Awards
{% for award in site.data.awards %}
{% if award.visible != false and award.selected == true %}
`{{ award.year }}`
{{ award.items | join: "; " }}

{% endif %}
{% endfor %}

## Service
{% for svc in site.data.service %}
{% if svc.visible != false and svc.selected == true %}
`{{ svc.year }}`
__{{ svc.title }}__, {{ svc.institution }}{% if svc.location %}, {{ svc.location }}{% endif %}
{% if svc.description %}
{% for desc in svc.description %}
- {{ desc }}
{% endfor %}
{% endif %}

{% endif %}
{% endfor %}
