
Obtain source from video/cx-video-plugin-ooyala which is a fork of https://github.com/ooyala/html5-analytics-plugins

## Repo setup step
- cd [path to repo parent folder]
- git clone [git hub repo location]
- cd ./html5-analytics-plugins
- git pull
- git submodule init
- git submodule update
- npm install
- npm install facebook/jest#0.5.x  # workaround for https://github.com/ooyala/html5-analytics-plugins/issues/77


## Building the analytics managers
gulp build
or
gulp (it defaults to build)

## Running unit tests
jest



