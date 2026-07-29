---
layout: page
permalink: /press/
title: press
description: Media coverage and interviews
nav: true
nav_order: 9
---

{% for item in site.data.press %}
{% if item.visible != false %}
**{{ item.title }}**
<br>*{{ item.venue }}*, {{ item.type }}, {{ item.year }}
{% if item.description %}<br>{{ item.description }}{% endif %}
<br>{% if item.links.video %}<a href="{{ item.links.video }}" class="btn-presentation btn-video">VIDEO</a> {% endif %}{% if item.links.audio %}<a href="{{ item.links.audio }}" class="btn-presentation btn-audio">AUDIO</a> {% endif %}{% if item.links.article %}<a href="{{ item.links.article }}" class="btn-presentation btn-article">ARTICLE</a> {% endif %}{% if item.links.x %}<a href="{{ item.links.x }}" class="btn-presentation btn-article">NVIDIA X</a> {% endif %}{% if item.links.huggingface %}<a href="{{ item.links.huggingface }}" class="btn-presentation btn-code">HUGGING FACE</a>{% endif %}

{% endif %}
{% endfor %}
