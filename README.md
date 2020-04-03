# Charla - Video conferencing

Charla is a video conferencing application based on [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection). It supports video conferences with multiple users.

For testing purposes ```charla.js``` uses
```
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/'
```
to configure the socket server. Availability and stability are not guaranteed. Please use your own server and replace the ```connection.socketURL``` value accordingly. For example, you can deploy https://github.com/muaz-khan/RTCMultiConnection on [Heroku](https://www.heroku.com/) using this [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/installation-guide.md). Heroku allows you to directly use the GitHub repository without any changes.

# Usage

Usage is minimalistic and the only thing required is a room id. This can be provided in the text field or by providing a URL hash. Participants can be invited by sharing the URL with room id. Charla automatically scales the participant videos to fit the screen. A double click on a video can be used to toggle fullscreen.

# Limitations
Charla inherits all performance features and limitations of the [video conferncing demo of RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/blob/master/demos/video-conferencing.html) and may introduce new features and mistakes by my own changes.

# Credits
Muaz Khan - [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection)

# License
MIT License

(c) Asvin Goel
