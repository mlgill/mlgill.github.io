#!/usr/bin/env zsh

# Example script to generate HTML and push to github.

#build site from markdown
bundle exec jekyll build

date_str=`date '+CV updated at %Y-%m-%d %H:%M:%S %z'`

git add . -A
git commit -m "$date_str"
git push -u origin master

cd ..
git add . -A
git commit -m "$date_str"
git push -u origin gh-pages 
