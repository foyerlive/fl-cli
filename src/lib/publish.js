import getNewestFile from './getNewestFile';

const publish = async(env) => {
  console.log('Publishing Time: ' + env);
  console.log('Checking authentication...');
  let authResult = await getAuth(env).catch((err) => {
    console.log('Caught an error', err);
    return false;
  });

  if (!authResult)
    throw 'No auth available...';

  console.log('Using token: ' + authResult);
  var file = getNewestFile('./dist/', new RegExp('.*\.js$'));
  console.log('Deploying file: ' + file);

  var packageContents = fs.readFileSync('./package.json', 'utf8');
  var packageObject = JSON.parse(packageContents);
  var fileContents = fs.readFileSync(file, 'utf8');

  var form = new FormData();
  form.append('app', packageObject.name);
  form.append('file', fileContents);
  form.append('filename', file.substring(7));

  var headers = {
    'Accept': 'application/json',
    'Content-Type': form.getHeaders()['content-type'],
    'Authorization': authResult
  };

  let host;
  switch (env) {
    case 'local':
      host = 'http://internal.foyerlive.com:9030/api/app/publish';
      break;
    case 'test':
      host = 'https://staging.foyerlive.com/api/app/publish';
      break;
    default:
      host = 'https://api.foyerlive.com/api/app/publish';
      break;

  }
  fetch(host, {
    method: 'POST',
    headers: headers,
    body: form
  }).then((response) => {
    return response.json();
  }).then((json) => {
    if (json.success) {
      console.log('Success!');
      if (json.hasOwnProperty('message'))
        console.log(json.message);
      if (json.hasOwnProperty('data') && json.data.hasOwnProperty('message'))
        console.log(json.data.message);
    } else {
      console.log('Error!', json);
    }
  }).catch((err) => {
    console.error('An error has occurred', err);
  });

};

export default publish;