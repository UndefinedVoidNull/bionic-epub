# bionic-epub
bionic-epub is a `Node.js` command-line tool to apply `Bionic Reading` styles to `.epub` file

## Effect
### Original
![Original](./screenshots/Original.png)

### Bionic
![Bionic](./screenshots/Bionic.png)

### BionicB
![BionicB](./screenshots/BionicB.png)


## How to use it
### Install dependencies
```bash
npm i
```

### Default colorful style
```bash
node ./index.js <epubPath>
```

### Black style
```bash
node ./index.js <epubPath> --black
```

## How to get a pdf version
1. install `Calibre`
2. use `ebook-convert` command (make sure the environmental variable path is correctly added)
```bash
ebook-convert <inputPath>.epub <outputPath>.pdf
```
