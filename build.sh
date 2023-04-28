cd $(dirname $0)
rm -rf ./dist
cd ./ui
npm run build
cd ../node
npm run build
mv ../ui/dist ./dist/ui
mv ./dist ../dist