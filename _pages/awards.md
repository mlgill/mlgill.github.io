---
layout: page
permalink: /awards/
title: awards
description: Honors and awards
nav: false
nav_order: 8
---

{% for award in site.data.awards %}
{% if award.visible != false %}
{% for item in award.items %}
**{{ item }}**
<br>{{ award.year }}

{% endfor %}
{% endif %}
{% endfor %}
