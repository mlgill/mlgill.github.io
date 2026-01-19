---
layout: page
permalink: /patents/
title: patents
description: Patent applications in deep learning and drug discovery
nav: true
nav_order: 6
---

{% for year_group in site.data.patents %}
## {{ year_group.year }}

{% for patent in year_group.entries %}
{% if patent.visible != false %}
**{{ patent.title }}**
<br>{{ patent.authors }}
<br>{{ patent.details }}

{% endif %}
{% endfor %}
{% endfor %}
