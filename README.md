# bionic-epub
bionic-epub is a Node.js command-line tool to apply Bionic Reading Styles to `.epub` file

## Effect


## How to use it
### install dependencies
```bash
npm i
```

### default colorful style
```bash
node ./index.js <epubPath>
```

### black style
```bash
node ./index.js <epubPath> --black
```

## How to get a pdf version
1. install `Calibre`
2. use `ebook-convert` command (make sure the environmental variable path is added)
```bash
ebook-convert <inputPath>.epub <outputPath>.pdf
```
