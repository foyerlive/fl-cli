const getNewestFile = (dir, regexp) => {
  let newest = null;
  let files = fs.readdirSync(dir)
  let one_matched = 0;

  for (let i = 0; i < files.length; i++) {

    if (regexp.test(files[i]) == false)
      continue
    else if (one_matched == 0) {
      newest = files[i];
      one_matched = 1;
      continue
    }

    f1_time = fs.statSync(files[i]).mtime.getTime();
    f2_time = fs.statSync(newest).mtime.getTime();
    if (f1_time > f2_time)
      newest[i] = files[i]
  }

  if (newest != null)
    return (dir + newest);
  return null
};

export default getNewestFile;