# Gavin Gao's Website

----------

## Summary

With the tutorial of w3school, I studied technology of Front End,which is as following.

* HTML
* CSS
* JavaScript

## Jekyll

* [Jekyll](https://jekyllrb.com/) is a blog-aware static site generator in Ruby
* [Jekyll 中文网](https://www.jekyll.com.cn/)
* Jekyll Themes
  - http://jekyllthemes.org/
  - https://jekyllthemes.io/
  - https://github.com/le4ker/personal-jekyll-theme
* [github上利用jekyll搭建自己的blog的操作顺序？](https://www.zhihu.com/question/30018945?sort=created)

### Install & Config on Ubuntu 16.04

* install ruby-dev: `sudo apt install ruby2.3-dev`
* install ruby-bundler: `sudo gem install bundler`
* generate or update **Gemfile**: delete **Gemfile.lock** and `bundle install`
* install Jekyll: `sudo gem install jekyll -v=<version-num>`, its verison depends on **Gemfile.lock** in your project
* run in your project dir: `jekyll serve` or `bundle exec jekyll serve`

### HOW TO RELEASE

#### Preparation

- *assets/css/main.scss* use configurable skin
- update *CHANGELOG.md*
- update version (*jekyll-text-theme.gemspec*, *package.json*, *_includes/scripts/variables.html*)

#### Publishing

- run `npm run gem-build` to build gem
- run `npm run gem-push` to publish gem to rubygems.org
- run `git add . && git commit -m  "release: vx.x.x"` to make a release commit
- run `git tag vx.x.x` to add a tag
- run `git push && git push origin vx.x.x` to push
- edit release on github.com

## Add-ons

* [博客园页面设置](http://www.cnblogs.com/zhaopei/p/4174811.html)
* [GitHub Ribbons](https://github.com/blog/273-github-ribbons)
* [JiaThis-社会化分享按钮](http://www.jiathis.com/)
* [bShare-分享按钮](http://www.bshare.cn/)
* [百度分享](http://share.baidu.com/)

## w3school

* [W3C](https://www.w3.org/)
* [w3schools](https://www.w3schools.com/)
* [w3school在线教程](http://www.w3school.com.cn/)
