---
layout: page
permalink: /education/
title: education
description: Academic background and training
nav: false
nav_order: 2
---

## Education

{% for edu in site.data.education %}
{% if edu.visible != false %}
**{{ edu.title }}**, {{ edu.year }}
<br>{{ edu.institution }}, {{ edu.location }}
{% if edu.description %}{% for desc in edu.description %}
<br>{{ desc }}{% endfor %}{% endif %}
{% if edu.links.thesis or edu.links.defense %}
<br>{% if edu.links.thesis %}[THESIS]({{ edu.links.thesis }}){% endif %}{% if edu.links.thesis and edu.links.defense %} | {% endif %}{% if edu.links.defense %}[DEFENSE]({{ edu.links.defense }}){% endif %}{% endif %}

{% endif %}
{% endfor %}
