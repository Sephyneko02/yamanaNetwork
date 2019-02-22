rsync -r src/ docs/
rsyng build/contracts/* docs/
git add .
git commit -m "compiles assets for github pages"
git push -u origin master
