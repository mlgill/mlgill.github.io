---
layout: page
permalink: /experience/
title: experience
description: Professional experience in AI, deep learning, and scientific research
nav: false
nav_order: 3
---

## Experience

{% assign current_institution = "" %}
{% for exp in site.data.experience %}
{% if exp.visible != false %}
{% assign inst_name = exp.institution | split: "," | first %}
{% if inst_name != current_institution %}
{% if current_institution != "" %}
---
{% endif %}
### {{ inst_name }}
{% assign current_institution = inst_name %}
{% endif %}

**{{ exp.title }}**, {{ exp.year }}
{% if exp.description %}{% for desc in exp.description %}
{{ desc }}
{% endfor %}{% endif %}

{% endif %}
{% endfor %}
