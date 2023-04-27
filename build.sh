cd $(dirname $0)
rm -rf ./dist
cd ./ui
npm run build
cd ../node
npm run build
mv ./dist ../dist
cd ..
cp -r ./ui/dist/* ./dist/ui