cd $(dirname $0)
rm -rf ./dist
cd ./ui
npm run build
cd ../node
npm run build
cp -r ../ui/dist/* ./dist/ui