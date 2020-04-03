# Charla - Video conferencing

Charla is a video conferencing application based on [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection). It supports video conferences with multiple users.

For testing purposes ```charla.js``` uses
```
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/'
```
to configure the socket server. Availability and stability are not guaranteed. Please use your own server and replace the ```connection.socketURL``` value accordingly. For example, you can deploy https://github.com/muaz-khan/RTCMultiConnection on [Heroku](https://www.heroku.com/) using this [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/installation-guide.md). Heroku allows you to directly use the GitHub repository without any changes.

# Credits
Muaz Khan - [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection)

# License
MIT License

(c) Asvin Goel
