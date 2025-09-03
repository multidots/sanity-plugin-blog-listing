// watch-and-push.js (CommonJS)
const chokidar = require('chokidar')
const {execSync} = require('child_process')

chokidar.watch(['./build', './src'], {ignored: /node_modules/}).on('all', () => {
  console.log('Changes detected - pushing via yalc...')
  try {
    execSync('yalc push', {stdio: 'inherit'})
  } catch (err) {
    // ignore yalc errors during watch
  }
})