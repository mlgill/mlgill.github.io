---
layout: page
permalink: /service/
title: community
description: Professional service and community involvement
nav: true
nav_order: 7
---

{% for svc in site.data.service %}{% if svc.visible != false %}
**{{ svc.title }}**<br>*{{ svc.institution }}*{% if svc.year %}, {{ svc.year }}{% endif %}{% if svc.description %}{% for desc in svc.description %}<br>{{ desc }}{% endfor %}{% endif %}

{% endif %}{% endfor %}
