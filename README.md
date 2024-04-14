# bionic-epub
📔 bionic-epub is a `Node.js` command-line tool to apply `Bionic Reading` styles to `.epub` file which can help you to **read faster**⚡🌠 and **focus more easily**🌳⏳

## effects
### Original
![Original](./screenshots/Original.png)

### BionicC (Default)
![Bionic](./screenshots/BionicC.png)

### BionicB (--black)
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

notice: `pandoc` will not keep the color by default

## testing
- `Calibre` passed ✅
- `NeoReader by Boox` passed ✅
- **some epub viewers not passed yet** ❌

## customization
- boldColors
- unfocusedOpacity

## notice
It will only apply the Bionic Style to `<p>`, `<h1>` to `<h6>`,  `<li>`, `<th>` and `<td>` , which means it will not apply the styles to any other elements