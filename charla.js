var connection = null;

window.addEventListener('load', (event) => {
	resizeVideos();

	// ......................................................
	// ..................RTCMultiConnection Code.............
	// ......................................................

	connection = new RTCMultiConnection();

	// socket.io server should be deployed on your own socket.io server
	//connection.socketURL = 'https://your servers.com:443';

	// below line should only be used for testing!
	 connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

	connection.socketMessageEvent = 'video-conference-demo';

	connection.session = {
	    audio: true,
	    video: true,
	    data: true
	};
	
	connection.sdpConstraints.mandatory = {
	    OfferToReceiveAudio: true,
	    OfferToReceiveVideo: true
	};
	
	// STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
	// via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
	var bitrates = 512;
	var resolutions = 'Ultra-HD';
	var videoConstraints = {};
	
	if (resolutions == 'HD') {
	    videoConstraints = {
	        width: {
	            ideal: 1280
	        },
	        height: {
	            ideal: 720
	        },
	        frameRate: 30
	    };
	}
	
	if (resolutions == 'Ultra-HD') {
	    videoConstraints = {
	        width: {
	            ideal: 1920
	        },
	        height: {
	            ideal: 1080
	        },
	        frameRate: 30
	    };
	}
	
	connection.mediaConstraints = {
	    video: videoConstraints,
	    audio: true
	};

	var CodecsHandler = connection.CodecsHandler;
	
	connection.processSdp = function(sdp) {
	    var codecs = 'vp8';
	    
	    if (codecs.length) {
	        sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
	    }
	
	    if (resolutions == 'HD') {
	        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
	            audio: 128,
	            video: bitrates,
	            screen: bitrates
	        });
	
	        sdp = CodecsHandler.setVideoBitrates(sdp, {
	            min: bitrates * 8 * 1024,
	            max: bitrates * 8 * 1024,
	        });
	    }
	
	    if (resolutions == 'Ultra-HD') {
	        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
	            audio: 128,
	            video: bitrates,
	            screen: bitrates
	        });
	
	        sdp = CodecsHandler.setVideoBitrates(sdp, {
	            min: bitrates * 8 * 1024,
	            max: bitrates * 8 * 1024,
	        });
	    }
	
	    return sdp;
	};
	// END_FIX_VIDEO_AUTO_PAUSE_ISSUES
	
	// https://www.rtcmulticonnection.org/docs/iceServers/
	// use your own TURN-server here!
	connection.iceServers = [{
	    'urls': [
	        'stun:stun.l.google.com:19302',
	        'stun:stun1.l.google.com:19302',
	        'stun:stun2.l.google.com:19302',
	        'stun:stun.l.google.com:19302?transport=udp',
	    ]
	}];
	
	connection.videosContainer = document.getElementById('video-container');
	connection.onstream = function(event) {
	    var existing = document.getElementById(event.streamid);
	    if(existing && existing.parentNode) {
	      existing.parentNode.removeChild(existing);
	    }
	
	    event.mediaElement.removeAttribute('src');
	    event.mediaElement.removeAttribute('srcObject');
	    event.mediaElement.muted = true;
	    event.mediaElement.volume = 0;
	
	    var div = document.createElement('div');
	    div.classList.add("video");
	    div.id = event.userid;
	    var video = document.createElement('video');
	    video.addEventListener("dblclick", function() {
		this.requestFullscreen();
	    });
	
	    try {
	        video.setAttributeNode(document.createAttribute('autoplay'));
	        video.setAttributeNode(document.createAttribute('playsinline'));
	    } catch (e) {
	        video.setAttribute('autoplay', true);
	        video.setAttribute('playsinline', true);
	    }
	
	    if(event.type === 'local') {
	      connection.userid = event.userid;
console.log("User id: " + connection.userid);
	      video.volume = 0;
	      try {
	          video.setAttributeNode(document.createAttribute('muted'));
	      } catch (e) {
	          video.setAttribute('muted', true);
	      }
	    }
	    video.srcObject = event.stream;

	    div.appendChild(video);
	    connection.videosContainer.appendChild(div);
	    resizeVideos();

	    if(event.type === 'local') {
	      connection.socket.on('disconnect', function() {
	        if(!connection.getAllParticipants().length) {
	          location.reload();
	        }
	      });
	    }

	    initHark({
	        stream: event.stream,
	        streamedObject: event,
	        connection: connection
	    });

	};
	
	connection.onstreamended = function(event) {
	    var video = document.getElementById(event.userid);
	    if (video) {
	        video.parentNode.removeChild(video);
	        resizeVideos();
	    }
	};

	connection.onMediaError = function(e) {
	    if (e.message === 'Concurrent mic process limit.') {
	        if (DetectRTC.audioInputDevices.length <= 1) {
	            alert('Please select external microphone. Check github issue number 483.');
	            return;
	        }
	
	        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
	        connection.mediaConstraints.audio = {
	            deviceId: secondaryMic
	        };
	
	        connection.join(connection.sessionid);
	    }
	};

	connection.onleave = function(event) {
//	    alert(JSON.stringify(event) + ' left.');
	    var video = document.getElementById(event.userid);
	    if (video) {
	        video.parentNode.removeChild(video);
	        resizeVideos();
	    }
	};

	// ......................................................
	// ............... Detect who is speaking ...............
	// ......................................................

	connection.onmessage = function(event) {
console.warn(JSON.stringify(event));
	    if (event.data && event.data.speaking != undefined) {
        	var video = document.getElementById(event.userid);
        	if (video) {
			if ( event.data.speaking ) {
				video.classList.add("speaking");
			}
			else {
				video.classList.remove("speaking");
			}
		}
	    }
	};

	function initHark(args) {
	    if (!window.hark) {
	        throw 'Please link hark.js';
	        return;
	    }
	
	    var connection = args.connection;
	    var streamedObject = args.streamedObject;
	    var stream = args.stream;

	    var options = {};
	    var speechEvents = hark(stream, options);
	
	    speechEvents.on('speaking', function() {
		if ( connection ) {
		        connection.send({
        		    speaking: true
        		});
	        	var video = document.getElementById(connection.userid);
        		if (video) {
				video.classList.add("speaking");
			}
		}
	    });

	    speechEvents.on('stopped_speaking', function() {
		if ( connection ) {
		        connection.send({
        		    speaking: false
        		});
	        	var video = document.getElementById(connection.userid);
        		if (video) {
				video.classList.remove("speaking");
			}
		}
	    });
	}



	// ......................................................
	// .......................UI Code........................
	// ......................................................

	var roomid = window.location.hash.replace('#', '') || '';

	if ( roomid.length > 0) {
		document.getElementById('exit').addEventListener('click', (event) => {
			connection.leave();
	
			window.location.hash = "";
			window.location.reload();

			var load_event = document.createEvent("HTMLEvents");
			load_event.initEvent("load", true, true);
			window.dispatchEvent(load_event);
		});
		document.getElementById('no-conference').classList.add('hide');
		document.getElementById('video-conference').classList.remove('hide');
		// Join room
		connection.openOrJoin(roomid);
	
	}
	else {
		document.getElementById('no-conference').classList.remove('hide');
		document.getElementById('video-conference').classList.add('hide');

		document.getElementById('open-or-join').addEventListener('click', (event) => {
			var element = document.getElementById('room-id');
			if ( element.value ) {
				window.location.hash = element.value;
				window.location.reload();
			}
		});
	}


});

window.addEventListener("beforeunload", function(e){
	if ( connection ) connection.leave();
}, false);

//window.addEventListener('resize', resizeVideos );
window.addEventListener('resize', function() {
	setTimeout(resizeVideos, 500);
});

function resizeVideos() {
	var width  = window.innerWidth || document.documentElement.clientWidth ||	document.body.clientWidth;
	var height = window.innerHeight|| document.documentElement.clientHeight|| 
document.body.clientHeight;

	var videos = document.querySelectorAll(".video:not(.dummy)");
	var dummy = document.querySelector(".video.dummy");
	if (videos.length < 2) {
		dummy.classList.remove("hide");
	}
	else {
		dummy.classList.add("hide");
	}

	var size = 0;
	var margin = 22; // must be big enough to include border
	var area = height * width;
	var videos = document.querySelectorAll(".video:not(.hide)");
	for (var rows=1; rows<= videos.length; rows++) {
		var columns = Math.ceil( videos.length / rows)
		var maxSize = Math.min(width / columns - margin* columns,   (height / rows - margin*rows)*4/3 );
//console.warn(width,height,rows,maxSize,maxSize/4*3)
		if ( maxSize > size) size = maxSize; 
	}
	for (var i=0; i < videos.length; i++) {
		videos[i].style.width = Math.floor(size) + "px";
		videos[i].style.height = Math.floor(size/4*3) + "px";
	}
}

