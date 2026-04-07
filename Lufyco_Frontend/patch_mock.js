const fs = require('fs');
const path = require('path');

const mockDataPath = path.join('d:/My_PaidProjects/Lufyco_Clothing/Lufyco_Frontend/app/data/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const images = [
    "04fe340acd523c96e4b87b737025cd247b5d017c.jpg",
    "05c9711004c6f4da74eb15af868997e2bdb58ae5.jpg",
    "07572d8e02d35791d9962d504da494499c441fb7.jpg",
    "09def1d916fe746ed3f38b20f41819dab58082bc.jpg",
    "15e8c54d665ab5d7a9b9f08c82346e325cbb25c2.jpg",
    "1d9b8dd4a416ce614faab38f891d281f6e532126.jpg",
    "311587e98c5efb88441122001d2f6738b645619f.jpg",
    "31f5266ad24c335037af08e454c2424a04e92c7d.jpg",
    "3951a442a4ea6e63223e1ee2cdc9b34973609a5d.jpg",
    "3ad65b4cfff8090b556cc65fce8b38fef31a006d.jpg",
    "5645f86a3ff80a18e2d25c95aad6b483b49898eb.jpg",
    "59c73eab9bcbe2e8211cd8492e255b1648b9ca56.jpg",
    "6965191e30839eb806a7abcdba649144dce48cfb.jpg",
    "6dda88270fbd2356cb5641cd2eeec16985e050ce.jpg",
    "72509a3291dfd35cafdd16f84756f8410ff2f7b4.jpg",
    "7d61dfe3bc42cf95acbcdd69e23f7faeaa1a095d.jpg",
    "8af8744f363932525f353481160f4e8081141e85.jpg",
    "ab085782f6ff19bf0c162f1d2d56ff3f996cc3fb.jpg",
    "b0ac050aae360d1dc7488d758203d881ad4cae10.jpg",
    "b9d03bdf60b3955da1b46ef3dbf3bddabef81ca2.jpg",
    "c0429b5f29cd3938114ed844ad1865f353913222.jpg",
    "e2d17b6710122d9553e31ff65a855e9c123c54f9.jpg",
    "e879cbcdd3aa29a38efcbc25ec29a7dc91c989ca.jpg",
    "f3786016c4528daf0fe0b783dc7b0fce5b80f47e.jpg"
];

let imgIndex = 0;
// Using a replacement function to map exactly the first 24
content = content.replace(/require\(['"]\.\.\/\.\.\/assets\/images\/categories\/[^'"]+['"]\)/g, (match) => {
    if (imgIndex < images.length) {
        const rep = `require('../../assets/images/categories/slider/${images[imgIndex]}')`;
        imgIndex++;
        return rep;
    }
    return match;
});

fs.writeFileSync(mockDataPath, content);
console.log('Updated ' + imgIndex + ' images in mockData!');
