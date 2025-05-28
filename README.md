# Peekbank Website

Built using [the jekyll-doc-theme](https://aksakalli.github.io/jekyll-doc-theme/).

## Running locally to make changes to site

You need Ruby and gem before starting. Follow the instructions [here](https://jekyllrb.com/docs/installation/). For OS X Big Sur, follow the instructions for installing with `rbenv` [here](https://jekyllrb.com/docs/installation/macos/).

Once you have Ruby and gem, then:

```bash
# install bundler
gem install bundler

# clone the project
git clone https://github.com/langcog/peekbank-website.git
cd peekbank-website

# install gems with bundler
bundle install

# run jekyll with dependencies
bundle exec jekyll serve
```

## How to host Shiny Apps

This site serves shiny apps that are hosted on a separate EC2 instance and displayed using an iframe. To manage the instance, use the LangCog's AWS Management Console. The instance is serving apps using Posit Connect. This set up parallels the set up for Wordbank, see the [wordbank-shiny README](https://github.com/langcog/wordbank-shiny?tab=readme-ov-file) for more documentation.

The domain name -- peekbank-connect.com -- was purchased via namecheap and configured to point at the elastic IP for the peekbank-shiny EC2 instance. To connect to the shiny server via https, an SSL certificate was created and configured using [these steps](https://paper.dropbox.com/doc/shiny-ssl-setup--Cms3_JB6wUC_pIc0OBdgnUzaAg-Nnin7iBJip0yHQ8G31hCN).
