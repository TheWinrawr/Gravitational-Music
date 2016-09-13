/*Set up audio*/
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//var canvasCtx = document.getElementById("canvas").getContext("2d");

/*Define audio nodes*/
var analyser;
var buffer;
var source;
var jsNode;

var numSamples = 128;

var frequencyData = [];
var song = {
	fileName: "Assets/Undertale OST_ 071 - Undertale.mp3",
	songName: "Undertale",
	author: "Toby Fox"
}

setupAudioNodes();
loadFile();

/**
 * Loads a song
 */
function loadFile() {
	var req = new XMLHttpRequest();
	req.open("GET", song.fileName, true);
	req.responseType = "arraybuffer";
	req.onload = function() {
		audioCtx.decodeAudioData(req.response, function(buffer) {
			play(buffer);
		});
	};
	req.send();
}

/**
 * Set up audio nodes
 */
function setupAudioNodes() {
	jsNode = audioCtx.createScriptProcessor(2048, 1, 1);
	jsNode.connect(audioCtx.destination);

	analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = 0.35;
	analyser.fftSize = numSamples;

	source = audioCtx.createBufferSource();
	source.connect(analyser);

	analyser.connect(jsNode);
	source.connect(audioCtx.destination);

}

function play(buffer) {
	source.buffer = buffer;
	source.start(0);
}

jsNode.onaudioprocess = function() {
	frequencyData = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(frequencyData);
	var average = getAverageVolume(frequencyData);
}

/**
 * Computes the average volume of the current song
 */
function getAverageVolume(array) {
	var values = 0;
	var average;

	for(var i = 0; i < array.length; i++) {
		values += array[i];
	}

	average = values/array.length;
	return average;

}

function drawSpectrum(array) {
	var lineWidth = 1500/array.length;
	canvasCtx.clearRect(0, 0, 1500, 400);
	canvasCtx.fillStyle = "black";
	for(var i = 0; i < array.length; i++) {
		canvasCtx.fillRect(lineWidth*i, 400-array[i], lineWidth, array[i]);
	}
}

function getFrequencyData() {
	return frequencyData;
}

function setNumSamples(num) {
	numSamples = num;
	analyser.fftSize = num;
}