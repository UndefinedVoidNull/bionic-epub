# bionic-epub
bionic-epub is a `Node.js` command-line tool to apply `Bionic Reading` styles to `.epub` file

## effects
### Original
![Original](./screenshots/Original.png)

### Bionic
![Bionic](./screenshots/Bionic.png)

### BionicB
![BionicB](./screenshots/BionicB.png)


## how to use it
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

## how to get a pdf version
1. install `Calibre`
2. use `ebook-convert` command (make sure the environmental variable path is correctly added)
```bash
ebook-convert <inputPath>.epub <outputPath>.pdf
```

## testing
`Calibre` passed

**some epub viewers not passed yet**

## customization
- boldColors
- unfocusedOpacity