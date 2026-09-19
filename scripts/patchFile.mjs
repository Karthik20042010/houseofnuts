import fs from "fs";
import path from "path";

export function patchFile(filePath, search, replace) {
  const fullPath = path.resolve(filePath);
  let content = fs.readFileSync(fullPath, "utf-8");
  const normContent = content.replace(/\r\n/g, "\n");
  const normSearch = search.replace(/\r\n/g, "\n");
  const normReplace = replace.replace(/\r\n/g, "\n");

  if (!normContent.includes(normSearch)) {
    throw new Error(`Target search text not found in ${filePath}`);
  }

  const isCRLF = content.includes("\r\n");
  let updated = normContent.replace(normSearch, normReplace);
  if (isCRLF) {
    updated = updated.replace(/\n/g, "\r\n");
  }

  fs.writeFileSync(fullPath, updated, "utf-8");
  console.log(`Successfully patched ${filePath}`);
}
