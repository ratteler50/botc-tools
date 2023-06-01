import axios from 'axios';
import fs from 'fs';

/** Download JSON files with character metadata and text. */
export async function downloadCharacterData(assetsPath: string) {
  // there's also tether.json and game-characters-restrictions.json which we don't download
  var downloads = ["roles", "jinx", "nightsheet"].map(file => {
    return {
      url: `https://script.bloodontheclocktower.com/data/${file}.json`,
      name: `${file}.json`,
    };
  });
  downloads.push({
    url: "https://raw.githubusercontent.com/bra1n/townsquare/develop/src/roles.json",
    name: "botc_online_roles.json",
  });
  await Promise.all(downloads.map(async (file) => {
    let destFile = `${assetsPath}/${file.name}`;
    if (fs.existsSync(destFile)) {
      console.log(`already have ${file.name}`);
      return;
    }
    let { data } = await axios.get(file.url, {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    });
    console.log(`downloaded ${file.name}`);
    return fs.promises.writeFile(destFile, data);
  }));
}
