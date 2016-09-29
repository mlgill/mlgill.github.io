#!/usr/bin/env zsh

# Example script to generate HTML and push to github.

#build site from markdown
bundle exec jekyll build

date_str=`date '+Website updated at %Y-%m-%d %H:%M:%S %z'`

cd _site
git add . -A
git commit -m "$date_str"
git push -u origin master

cd ..
git add . -A
git commit -m "$date_str"
git push -u origin jekyll 
